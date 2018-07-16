import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import MapContainer from './MapContainer';

import DetailView from './DetailView';

import Marker from './Marker';

export default class MapView extends React.Component {
  constructor(props) {
    super(props);

    let serviceLang = "";
    let lang = localStorage.getItem("lang");
    if(lang == 'kr') {
      serviceLang = "KorService";
    } else {
      serviceLang = "EngService";
    }
  
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if(favorites == null) favorites = [];
    // make or read favorite list
  
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    this.state = {
      urlForContentBase: "https://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=", 
      urlForContentRemain: "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC" + 
        "&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=1000&pageNo=1",
      segmentIndex: 0,
      itemCarouselIndex: 0,
      items: [],
      numOfDrawnItems: 0,
      placeCarouselItems: [],
      availCategories: [],
      filterCarouselIndex: 0,
      filterCarouselItems: [],
      strings: strings,
      favorites: favorites,
      filtered: [],
      sigunguCode: 0,
      lang: lang,
      markers: [],
      searchString: ""
    };
    // initialize states.

    let selectedCode = localStorage.getItem("code");
    let cache = JSON.parse(localStorage.getItem("items" + selectedCode));
    let useCache = false;
    if(cache != null) {
      let cacheValidUntil = new Date(cache.createdDateTime);
      cacheValidUntil.setDate(cacheValidUntil.getDate() + 1); 
      // cache will be valid until + 1 day of the created day.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
        // compare and if cache is fresh
        useCache = true;
      }
    }

    if(useCache) {
      var this_ = this;
      const sleepTime = 500;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        let ret = this_.makeContents(cache.items, favorites, 0);
        setTimeout(resolve, sleepTime, ret); // set some timeout to render page first
      }).then(function(result) {
        // success callback
        let {availCategories, filterCarouselItems, placeCarouselItems, markers} = result; 
        this_.setState({
          items: cache.items, 
          availCategories: availCategories, 
          filterCarouselItems: filterCarouselItems,
          placeCarouselItems: placeCarouselItems,
          markers: markers,
          numOfDrawnItem: placeCarouselItems.length,
          filtered: []});
      });
    } else {
      // if cache is not valid then read from web
      this.readListsFromWebAndMakeContents(selectedCode);
    }
  }

  showMenu() {
    this.props.showMenu();
  }

  toggleFavorite(key) {
    let favoritesCopy = this.state.favorites.slice(0); // copy array
    let indexToRemove = -1;
    for(let i = 0; i < favoritesCopy.length; i++) {
      let favorite = favoritesCopy[i];
      if(favorite == key) {
        indexToRemove = i;
        break;
      }     
    }
    if(indexToRemove == -1)
    {
      favoritesCopy.push(key); // push to favorite list
    } else {
      favoritesCopy.splice(indexToRemove, 1); // remove untoggled favorate
    }
    localStorage.setItem("favorites", JSON.stringify(favoritesCopy)); // change favorite list and save it.

    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(
        this.state.items, favoritesCopy, this.state.filtered, this.state.sigunguCode, this.state.searchString);

    this.setState({
      favorites: favoritesCopy, 
      placeCarouselItems : placeCarouselItems,
      markers: markers,
      numOfDrawnItem: placeCarouselItems.length});
  }

  makeItemCarouselAndMarkers(items, favorites, filtered, sigunguCode, searchString) {
    const arrowIconSize = {
      default: 30,
      material: 28
    };

    const starIconSize = {
      default: 30,
      material: 28
    };

    const grayColor = "#D3D3D3";
    const goldColor = "#FFD700";

    let placeCarouselItems = []; // carousel items
    let markers = [];

    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let proceed = false;
      let sigunguCodeOfItem = item.sigungucode == null ? null : item.sigungucode._text;
      if(sigunguCode != 0 && sigunguCodeOfItem != sigunguCode) continue;

      if(filtered.length >= 1) {
        let cat3 = item.cat3 == null ? "" : item.cat3._text;

        for(let j = 0; j < filtered.length; j++) {
          let filter = filtered[j];
          if(filter == cat3) { // check whether this item's category is in the filter or not 
            proceed = true;
            break;
          }
        }
      }

      if(!proceed && filtered.length >= 1) continue; // if filter activated && not proceed,

      let mapX = item.mapx == null ? null : item.mapx._text;
      let mapY = item.mapy == null ? null : item.mapy._text;
      let addr = item.addr1 == null ? "" : item.addr1._text;
      let title = item.title == null ? "" : item.title._text;
      let tel = item.tel;
      let image = item.firstimage;
      let zipCode = item.zipcode;
      let contentId = item.contentid == null ? null : item.contentid._text;
      let contentTypeId = item.contenttypeid == null ? null : item.contenttypeid._text;

      if(contentId == null || contentTypeId == null || mapX == null || mapY == null) {
        // not proper content, skip it.
        continue;
      }

      if(searchString.length > 1 && title.includes(searchString) == false) continue;
      // if it is not searched one, skip
      
      let marker = {lat: mapY, lng: mapX};
      markers.push(marker);
      // make markers on the map and push it in the array

      let carouselKey = "carousel-" + contentId;

      let imageSrc = image == null ? 
        (<img src="img/noimage.png" style={{width: "100%"}} />) : 
        (<img src={image._text} style={{width: "100%"}} />);
  
      let telLink = tel == null ? null : "tel:" + tel._text;
      let telTag = tel == null ? null : 
        (<a href={telLink}>{tel._text}</a>);
      let detailButton = (
        <Button key={contentId} onClick={this.goDetails.bind(this, contentId, contentTypeId)}>
         {this.state.strings.godetails}
        </Button>);
      let zipCodeString = zipCode == null ? null : 
        this.state.strings.zipcode + " : " + zipCode._text;

      let starColor = grayColor;

      for(let j = 0; j < favorites.length; j++) {
        if(favorites[j] == contentId) {
          starColor = goldColor; // change star color
          break;
        }
      }

      let placeCarouselItem = (
        <CarouselItem key={carouselKey}>
          <div style={{height: "35%", padding: "1px 0 0 0", textAlign: "center"}}>
            <div className="card">
              <div className="card__title">
                <Row>
                  <Col width="80%">
                    <h2 style={{margin: "1%"}}>{title}</h2>
                  </Col>
                  <Col width="20%">
                    <div style={{textAligh: "center"}}>
                      <Button modifier='quiet' 
                        style={{width: '100%', textAlign: "center", color: starColor}}
                        onClick={this.toggleFavorite.bind(this, contentId)}>
                        <Icon icon='md-star' size={starIconSize}/>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="card__content">
                <Row style={{width: "100%"}}>
                  <Col width="5%">
                    <Button modifier='quiet' 
                      onClick={this.prevItem.bind(this)} 
                      style={{width: '100%', padding: "5%"}}>
                      <Icon icon='md-chevron-left' size={arrowIconSize} />
                    </Button>
                  </Col>
                  <Col width="37%">
                    <div style={{textAlign: "center", padding: "1%"}}>
                      {imageSrc}
                    </div>
                  </Col>
                  <Col width="53%">
                    <div style={{padding: "1%"}}>
                      <p style={{margin: "1%"}}>{addr}</p>
                      <p style={{color: "#A9A9A9", margin: "1%"}}>{zipCodeString}</p>
                      <p style={{margin: "1%"}}>{telTag}</p>
                      <div style={{margin: "2%"}}>
                        {detailButton}
                      </div>
                    </div>
                  </Col>
                  <Col width="5%">
                    <Button modifier='quiet' 
                      onClick={this.nextItem.bind(this)} 
                      style={{width: '100%', padding: "5%"}}>
                      <Icon icon='md-chevron-right' size={arrowIconSize} />
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </CarouselItem>);

      placeCarouselItems.push(placeCarouselItem);
    }
    return {placeCarouselItems: placeCarouselItems, markers: markers}; 
  }

  drawCategoryCarousel(availCategories, filtered) {
    /* make category filter buttons */
    const filterButtonStyle = {
      width: '22%', // draw 4 buttons on single carousel
      margin: '1%',
      height: '30px',
      fontSize: '0.7em',
      padding: '1px'
    };

    let buttonStyle = {
      width: '2%',
      padding: '0px',
      height: '30px',
      fontSize: '0.7em'
    };

    const innerDivStyle = {
      textAlign: "center",
      margin: '0%',
      height: '30px'
    };

    /* prev button for carousel */
    let backButton = (
      <Button modifier='quiet' style={buttonStyle} onClick={this.goPrevFilterCarousel.bind(this)}>
        <div style={innerDivStyle}>&lt;</div>
      </Button>);

    /* next button for carousel */
    let nextButton =(
      <Button modifier='quiet' style={buttonStyle} onClick={this.goNextFilterCarousel.bind(this)}>
        <div style={innerDivStyle}>&gt;</div>
      </Button>); 
    
    let filterCarouselItems = [];
    // four buttons in a row, so make length / 4 size of carousel item
    for(let i = 0; i < availCategories.length / 4; i++) {
      // four buttons in a row
      let start = i * 4;
      let end = start + 4;
      // four buttons will be grouped in a buttonGroup array and then stored into a carousel item.
      let buttonGroup = [];
      // add prev button at first
      buttonGroup.push(backButton);
      for(let j = start; j < end; j++) {
        // if a item with index is not null or not undefined, make that into button with key.
        if(availCategories[j] != null) {
          let category = availCategories[j];
          let modifier = 'outline'; // default inactive button style is outline.
          if(filtered.length <= 0) {
            if(j == 0) modifier = null;
          }
          else {
            for(let fi = 0; fi < filtered.length; fi++) {
              if(filtered[fi] == category.key) {
                modifier = null;
                break;
              }
            }
          }

          // the first button is button for no filter. so let us make this button in active.
          let button = (
            <Button key={category.key} style={filterButtonStyle} modifier={modifier}
              onClick={this.toggleFilterStatus.bind(this, category.key)}>
              <div style={innerDivStyle}>
                {category.value}
              </div>
            </Button>);
          buttonGroup.push(button);
        } else {
          // make dummy button. if there is no proper item.
          let button = (<Button 
            style={{width:'21%', margin: '1%', height: '30px'}} modifier='quiet' disabled={true}>
            <div style={innerDivStyle}>
            </div></Button>);
          buttonGroup.push(button);
        }
      }
      // add next button at first
      buttonGroup.push(nextButton);
      // make carousel item with grouped buttons.
      let carouselItem = (<CarouselItem key={i}>
        <div style={{textAlign: "left"}}>{buttonGroup}</div></CarouselItem>);
      // and add it.
      filterCarouselItems.push(carouselItem);
    }

    return filterCarouselItems;
  }


  makeAvailCategoryListFromItems(items) {
    var availCategorySet = new Set();

    /* read available category from API and store them into a set*/
    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let cat3 = item.cat3;
      if(cat3 != null) {
        let cat3Code = cat3._text;
        availCategorySet.add(cat3Code)
      }
    }

    let categories_kr = require('public/category/category_kr.json'); /* load all category pack (kr) */
    let categories_en = require('public/category/category_en.json'); /* load all category pack (kr) */
    let categoryAll = {key: "0", value: "전체"};
    let allCategories = null;

    let lang = this.state.strings.getLanguage();
    if(lang == 'kr') {
      allCategories = categories_kr;
    } else {
      allCategories = categories_en;
      categoryAll = {key: "0", value: "All"};
    }
 
    let availCategories = [];
    availCategories.push(categoryAll);

    /* compare all category and set item and if the category is available one, 
     * push it into availCategories */
    for(let i = 0; i < allCategories.length; i++) {
      let category = allCategories[i];
      if(availCategorySet.has(category.key)) {
        availCategories.push(category);
      }
    }

    return availCategories;
  }

  makeContents(items, favorites, sigunguCode) {
    let emptyFilter = [];

    let availCategories = this.makeAvailCategoryListFromItems(items);
    let filterCarouselItems = this.drawCategoryCarousel(availCategories, emptyFilter);
    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(items, favorites, emptyFilter, sigunguCode, "");

    return {
      availCategories: availCategories,
      filterCarouselItems: filterCarouselItems,
      placeCarouselItems: placeCarouselItems,
      markers: markers
    };
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
    console.log(items);
    return items;
  } 

  writeItemCache(code, items) {
    let cacheName = "items" + code;
    let cacheCreatedDateTime = new Date();
    let cacheValue = {createdDateTime: cacheCreatedDateTime, items: items};
    localStorage.setItem(cacheName, JSON.stringify(cacheValue));
  }

  readListsFromWebAndMakeContents(code) {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let items = this_.readItemsFromResponseText(xhr.responseText);
        this_.writeItemCache(code, items); // write cache to manage # of calls of API

        let {availCategories, filterCarouselItems, placeCarouselItems, markers} = 
          this_.makeContents(items, this_.state.favorites, this_.state.sigunguCode);

        this_.setState({
          items: items, 
          availCategories: availCategories, 
          filterCarouselItems: filterCarouselItems,
          placeCarouselItems: placeCarouselItems,
          markers: markers,
          numOfDrawnItem: placeCarouselItems.length,
          filtered: []});

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForContentBase + code + this_.state.urlForContentRemain);
      xhr.send(null);
    });
  }

  toggleFilterStatus(key) {
    let newFiltered = this.state.filtered.slice(); // copy the array
    if(key == '0') {
      // When 'All' button(key: 0) is clicked?
      // Turn on 'All' button. And clear filter.
      newFiltered = [];
    }
    else {
      let indexToRemove = -1;
      
      for(let i = 0; i < newFiltered.length; i++) {
        let filter = newFiltered[i];
        if(filter == key) {
          indexToRemove = i;
          break;
        }
      }
      if(indexToRemove == -1)
      {
        newFiltered.push(key);
      } else {
        newFiltered.splice(indexToRemove, 1); // remove item
      }
    }
    
    let filterCarouselItems = this.drawCategoryCarousel(this.state.availCategories, newFiltered);
    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(
        this.state.items, this.state.favorites, newFiltered, this.state.sigunguCode, this.state.searchString);

    this.setState({
      filterCarouselItems: filterCarouselItems,
      filtered: newFiltered,
      placeCarouselItems: placeCarouselItems,
      markers: markers,
      numOfDrawnItem: placeCarouselItems.length});
  }

  goPrevFilterCarousel() {
    let change = this.state.filterCarouselIndex - 1 < 0 ? 
      Math.round(this.state.availCategories.length / 4) - 1 : 
      this.state.filterCarouselIndex - 1;

    this.setState({filterCarouselIndex: change});
  }

  goNextFilterCarousel() {
    let change = this.state.filterCarouselIndex + 1 > Math.round(this.state.availCategories.length / 4) - 1 ? 
      0 : 
      this.state.filterCarouselIndex + 1;

    this.setState({filterCarouselIndex: change});
  }

  prevItem() {
    let change = this.state.itemCarouselIndex - 1 < 0 ?
      this.state.numOfDrawnItem - 1 :
      this.state.itemCarouselIndex - 1;
    this.setState({itemCarouselIndex: change});
  }

  nextItem() {
    let change = this.state.itemCarouselIndex + 1 > this.state.numOfDrawnItem - 1 ?
      0 :
      this.state.itemCarouselIndex + 1;
    this.setState({itemCarouselIndex: change});
  }

  goDetails(contentId, contentTypeId) {
    localStorage.setItem("contentId", contentId);
    localStorage.setItem("contentTypeId", contentTypeId);
    this.props.navigator.pushPage({ 
      component: DetailView 
    });

  }

  renderToolbar() {
    const imgStyle= {
      height: '15px',
      marginTop: '5%'
    };

    return (
      <Toolbar>
        <div className="left"><BackButton></BackButton></div>
        <div className="center">
        Islander Jeju <img src="img/milgam.png" style={imgStyle} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon icon='ion-navicon, material:md-menu' />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }
  
  loadListView() {
    console.log("list view button clicked!");
  }

  handleCategoryChange(e) {
    this.setState({filterCarouselIndex: e.activeIndex});
  }

  handlePlaceChange(e) {
    this.setState({itemCarouselIndex: e.activeIndex});
  }

  handleAddressFilter(e) {
    let sigunguCode = 0;

    if (e.index == 0) sigunguCode = 0; // 0 means all
    else if(e.index == 1) sigunguCode = 3; // seoguipo code == 3 
    else if(e.index == 2) sigunguCode = 4; // jeju code == 4
    else {
      console.log("Unknown index of button selected.");
      sigunguCode = 0; // default all
    }
    
    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(
        this.state.items, this.state.favorites, this.state.filtered, sigunguCode, this.state.searchString);

    this.setState({
      placeCarouselItems: placeCarouselItems,
      markers: markers,
      numOfDrawnItem: placeCarouselItems.length,
      sigunguCode: sigunguCode,
      segmentIndex: e.index});
  }

  handleSearchBox(e) {
    let searchString = e.target.value;
    if(searchString.length <= 0) {
      // clear search
      this.searchUsingSearchString("");
    }
    this.setState({searchString: searchString});
  }
  
  searchUsingSearchString(string) {
    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(
        this.state.items, this.state.favorites, this.state.filtered, this.state.sigunguCode, string);

    this.setState({
      placeCarouselItems: placeCarouselItems,
      markers: markers,
      numOfDrawnItem: placeCarouselItems.length});
  } 
 
  handleSearchButton() {
    this.searchUsingSearchString(this.state.searchString);
  }

  markerClicked(e, id) {
    this.setState({itemCarouselIndex: id});
  }

  drawSingleMarker(lat, lng, color, zIndex, id) {
    return (<Marker position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} />);
  }

  render() {
    const centerDiv = {
      textAlign: 'center'
    };

    const innerDiv = {
      margin: '1%'
    };
    
    const hrStyle = {
      margin: '1px'
    };


    let fullWidth = window.innerWidth + "px";

    let filterCarousel = this.state.filterCarouselItems.length <= 0 ? "Loading..." : 
      (<Carousel
         style={{width: fullWidth}}
         onPostChange={this.handleCategoryChange.bind(this)} 
         index={this.state.filterCarouselIndex} 
         autoScrollRatio={0.3} 
         autoScroll overscrollable swipeable>
         {this.state.filterCarouselItems}
       </Carousel>);

    let placeCarousel = this.state.items.length <= 0 ? (<ProgressCircular indeterminate />) :
      (<Carousel
         style={{width: fullWidth}}
         onPostChange={this.handlePlaceChange.bind(this)} 
         index = {this.state.itemCarouselIndex}
         autoScrollRatio={0.3}
         autoScroll overscrollable swipeable>
         {this.state.placeCarouselItems}
       </Carousel>);

    const mapCenter = {
      lat: 33.356432,
      lng: 126.5268767
    };

    const mapZoom = 9;
    const markerGray = 'C0C0C0';
    const markerChrimsonRed = 'DC134C'

    let itemCarouselIndex = this.state.itemCarouselIndex;
    let markersInfo = this.state.markers.length <= 0 ? 
      null : 
      this.state.markers;

    let markers = [];
    const topMost = 9999;

    if(markersInfo != null) {
      if(this.state.filtered.length > 0) {
        for(let i = 0; i < markersInfo.length; i++) {
          let markerInfo = markersInfo[i];
          let marker = null;
          if(i == itemCarouselIndex) {
            marker = this.drawSingleMarker(markerInfo.lat, markerInfo.lng, markerChrimsonRed, topMost, i);
          }
          else {
            marker = this.drawSingleMarker(markerInfo.lat, markerInfo.lng, markerGray, i, i);
          }
          markers.push(marker);
        }
      } else {
        let markerInfo = markersInfo[itemCarouselIndex];
        markers.push(this.drawSingleMarker(markerInfo.lat, markerInfo.lng, markerChrimsonRed, 9999));
      }
    }

    let map = (
      <MapContainer initialCenter={mapCenter} zoom={mapZoom} google={this.props.google}>
        {markers}
      </MapContainer>);

    const searchIconSize = {
      default: 24,
      material: 22
    };

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={centerDiv}>
          <div style={innerDiv}>
            <Segment index={this.state.segmentIndex} 
              onPostChange={this.handleAddressFilter.bind(this)} style={{ width: '55%' }}>
              <Button>{this.state.strings.all}</Button>
              <Button>{this.state.strings.seoguipo}</Button>
              <Button>{this.state.strings.jeju}</Button>
            </Segment>
          </div>
          <div style={innerDiv}>
            <SearchInput
              placeholder='Search...' onChange={this.handleSearchBox.bind(this)} />
            <Button onClick={this.handleSearchButton.bind(this)} 
              modifier='quiet' style={{margin: '2px', padding: '2px'}}>
              <Icon icon='md-search' size={searchIconSize} />
            </Button>
          </div>
          <div style={{marginTop: '1%', marginBottom: '1%'}}>
            {map}
          </div>
          <div>
            <hr style={hrStyle}/>
            {filterCarousel}
            <hr style={hrStyle}/>
          </div>
          <div>
            {placeCarousel}
          </div>
        </div>
        <Fab onClick={this.loadListView.bind(this)} style={{bottom: '5%', right: '10px', position: 'fixed'}}>
          <Icon icon='fa-bars' />
        </Fab>
      </Page>
    );
  }
}
