import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, Card} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import MapContainer from './MapContainer';
import DetailView from './DetailView';
import ListView from './ListView';
import Marker from './Marker';
import TopToggleView from './TopToggleView';
import TopSearchView from './TopSearchView';
import FilterCarouselView from './FilterCarouselView';
import GooglePlaceImageView from './GooglePlaceImageView'

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
    if(favorites == null) {
      favorites = [];
      localStorage.setItem("favorites", JSON.stringify(favorites)); // change favorite list and save it.
      // make or read favorite list
    }

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
      strings: strings,
      favorites: favorites,
      filtered: [],
      sigunguCode: 0,
      lang: lang,
      markers: [],
      searchString: ""
    };
    this.overScrolled = false;
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
        let {placeCarouselItems, markers} = result; 
        this_.setState({
          items: cache.items, 
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

  componentDidUpdate(prevProps) {
    let favorites = localStorage.getItem('favorites');
    if(favorites != JSON.stringify(this.state.favorites)) {
      favorites = JSON.parse(favorites);
      let {placeCarouselItems, markers} = 
        this.makeItemCarouselAndMarkers(
          this.state.items, favorites, this.state.filtered, this.state.sigunguCode, this.state.searchString);

      this.setState({
        favorites: favorites, 
        placeCarouselItems: placeCarouselItems,
        markers: markers,
        numOfDrawnItem: placeCarouselItems.length});
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

    let realIndex = 0;

    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let proceed = false;
      let sigunguCodeOfItem = item.sigungucode == null ? null : item.sigungucode._text;
      if(sigunguCode != 0 && sigunguCodeOfItem != sigunguCode) continue;
      let cat3 = item.cat3 == null ? "" : item.cat3._text;

      if(filtered.length >= 1) {
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
      let imageKey = "image-" + realIndex;
      let titleKey = "title-" + realIndex++;

      let imageSrc = image == null ? 
        (<GooglePlaceImageView maxWidth = {400} maxHeight = {400} 
          placeTitle = {title} listThumbnail = {false} multi = {false} />) :
        (<img id={imageKey} src={image._text} style={{width: "100%"}} />);
  
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
        <div style={{height: "35%", padding: "1px 0 0 0", textAlign: "center"}}>
          <div className="card">
            <div className="card__title">
              <Row>
                <Col width="80%">
                  <h2 id={titleKey} style={{margin: "1%"}}>{title}</h2>
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
                    {tel != null ? (<div dangerouslySetInnerHTML={this.createMarkup(tel._text)} />) : null}
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
      );

      placeCarouselItems.push(placeCarouselItem);
    }
    return {placeCarouselItems: placeCarouselItems, markers: markers}; 
  }

  makeContents(items, favorites, sigunguCode) {
    let emptyFilter = [];

    let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(items, favorites, emptyFilter, sigunguCode, "");

    return {
      placeCarouselItems: placeCarouselItems,
      markers: markers
    };
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
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

        let {placeCarouselItems, markers} = 
          this_.makeContents(items, this_.state.favorites, this_.state.sigunguCode);

        this_.setState({
          items: items, 
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

  toggleFilterStatus(newFilteredList) {
   let {placeCarouselItems, markers} = 
      this.makeItemCarouselAndMarkers(
        this.state.items, this.state.favorites, newFilteredList, 
        this.state.sigunguCode, this.state.searchString);

    this.setState({
      filtered: newFilteredList,
      placeCarouselItems: placeCarouselItems,
      markers: markers,
      numOfDrawnItem: placeCarouselItems.length});
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
   this.props.navigator.pushPage({ 
      component: ListView
    });
  }

  handlePlaceChange(e) {
    if(this.overScrolled) {
      this.overScrolled = false;
      this.setState({});
      return;
    }
    this.setState({itemCarouselIndex: e.activeIndex});
  }

  overScroll() {
    this.overScrolled = true;

    if(this.state.itemCarouselIndex == this.state.numOfDrawnItem - 1) {
      // reached to the end
      this.nextItem();
    } else {
      // reached to the first
      this.prevItem();
    }
  }

  handleAddressFilter(index) {
    let sigunguCode = 0;

    if (index == 0) sigunguCode = 0; // 0 means all
    else if(index == 1) sigunguCode = 3; // seoguipo code == 3 
    else if(index == 2) sigunguCode = 4; // jeju code == 4
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
      segmentIndex: index});
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
      itemCarouselIndex: 0,
      numOfDrawnItem: placeCarouselItems.length});
  } 
 
  handleSearchButton() {
    this.searchUsingSearchString(this.state.searchString);
  }

  markerClicked(e, id) {
    this.setState({itemCarouselIndex: id});
  }

  drawSingleMarker(lat, lng, color, zIndex, id) {
    let markerKey = "marker-" + id;
    return (<Marker key = {markerKey} 
             position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} text="%E2%80%A2"/>);
  }

  createMarkup(text) {
    return {__html: text }; 
  }

  render() {
    const centerDiv = {
      textAlign: 'center'
    };

    const hrStyle = {
      margin: '1px'
    };

    let fullWidth = window.innerWidth + "px";
    let placeCarousel = this.state.items.length <= 0 ? (<ProgressCircular indeterminate />) :
      (<Carousel
         style={{width: fullWidth}}
         onPostChange={this.handlePlaceChange.bind(this)}
         onOverscroll={this.overScroll.bind(this)} 
         index = {this.state.itemCarouselIndex}
         autoScrollRatio={0.3}
         autoScroll overscrollable swipeable>
         {this.state.placeCarouselItems.map((item, index) => (
           <CarouselItem key={"carousel-" + index}>
             {this.state.itemCarouselIndex - 1 <= index && this.state.itemCarouselIndex + 1 >= index ?
               <div>{item}</div> : 
               <div>
                 <Card>
                   <div className="title center">Loading...</div>
                   <div className="content">Please wait...</div>
                 </Card>
               </div>}
           </CarouselItem>
         ))}
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
      <MapContainer initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
        width = "100vw" height = "35vh">
        {markers}
      </MapContainer>);

    return (
      <Page renderToolbar = {this.renderToolbar.bind(this)}>
        <div style = {centerDiv}>
          <TopToggleView index = {this.state.segmentIndex} 
            onPostChange = {this.handleAddressFilter.bind(this)} 
            strings = {this.state.strings}/>
          <TopSearchView onChange = {this.handleSearchBox.bind(this)} 
            onClick = {this.handleSearchButton.bind(this)}/> 
          <div style = {{marginTop: '1%', marginBottom: '1%'}}>
            {map}
          </div>
          <div>
            <hr style = {hrStyle}/>
            <FilterCarouselView 
              width = {fullWidth}
              strings = {this.state.strings} 
              items = {this.state.items}
              onFilterClicked = {this.toggleFilterStatus.bind(this)}
            />
            <hr style={hrStyle}/>
          </div>
          <div>
            {placeCarousel}
          </div>
        </div>
        <Fab onClick={this.loadListView.bind(this)} style={{bottom: '10px', right: '10px', position: 'fixed'}}>
          <Icon icon='fa-bars' />
        </Fab>
      </Page>
    );
  }
}
