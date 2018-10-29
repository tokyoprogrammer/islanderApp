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
import GooglePlaceImageView from './GooglePlaceImageView';

import {MapViewStyle, ToolbarStyle, CenterDivStyle} from './Styles';

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

    let categories = [];
    if(lang == "kr") {
      categories = require('public/category/category_kr.json');
    } else {
      categories = require('public/category/category_en.json');
    }

    let categoriesMap = {};
    for(let i = 0; i < categories.length; i++) {
      let item = categories[i]; 
      categoriesMap[item.key] = item.value;
    }

    this.categories = categoriesMap;

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
    const serviceKey = process.env.REACT_APP_VISIT_KOREA_API_KEY; 

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
    const Style = MapViewStyle.carouselItem;
    const starIconSize = Style.favoriteBtn.size;
    const grayColor = Style.favoriteBtn.colors.gray;
    const goldColor = Style.favoriteBtn.colors.gold;

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

      let cat3Text = cat3.length > 1 ? this.categories[cat3] : null;
      const badgeStyle = Style.badge.style;
      let badge = cat3 != null ? (<span style={badgeStyle}>{cat3Text}</span>) : null;

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

      if(this.state.strings.getLanguage() != "kr") {
        let tempTitle = title.split("(");
        if(tempTitle.length > 0) title = tempTitle[0];
      }

      let carouselKey = "carousel-" + contentId;
      let imageKey = "image-" + realIndex;
      let titleKey = "title-" + realIndex++;

      let imageSrc = image == null ? 
        (<GooglePlaceImageView 
          maxWidth={Style.img.google.width} 
          maxHeight={Style.img.google.height} 
          placeTitle = {title} listThumbnail = {false} multi = {false} />) :
        (<img id={imageKey} src={image._text} style={Style.img.style} />);
  
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
        <div style={Style.container.style}>
          <div className="card">
            <div className="card__title">
              <Row>
                <Col width={Style.titleRow.col1.width}>
                  <b id={titleKey} style={Style.title.style}>{title}</b>{badge}
                </Col>
                <Col width={Style.titleRow.col2.width}>
                  <div style={Style.titleRow.col2.containerDiv.style}>
                    <Button modifier='quiet' 
                      style={Object.assign({color: starColor}, Style.favoriteBtn.style)}
                      onClick={this.toggleFavorite.bind(this, contentId)}>
                      <Icon icon={Style.favoriteBtn.icon} size={starIconSize}/>
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="card__content">
              <Row style={Style.contentRow.style}>
                <Col width={Style.contentRow.col1.width}>
                  <Button modifier='quiet' 
                    onClick={this.prevItem.bind(this)} 
                    style={Style.contentRow.col1.arrowIcon.button.style}>
                    <Icon icon={Style.contentRow.col1.arrowIcon.iconLeft} 
                      size={Style.contentRow.col1.arrowIcon.size} />
                  </Button>
                </Col>
                <Col width={Style.contentRow.col2.width}>
                  <div style={Style.contentRow.col2.container.style}>
                    {imageSrc}
                  </div>
                </Col>
                <Col width={Style.contentRow.col3.width}>
                  <div style={Style.contentRow.col3.container.style}>
                    <p style={Style.contentRow.col3.container.addrText.style}>{addr}</p>
                    <p style={Style.contentRow.col3.container.zipCode.style}>
                      {zipCodeString}
                    </p>
                    {tel != null ? (<div dangerouslySetInnerHTML={this.createMarkup(tel._text)} />) : null}
                    <div style={Style.contentRow.col3.container.detailBtn.style}>
                      {detailButton}
                    </div>
                  </div>
                </Col>
                <Col width={Style.contentRow.col4.width}>
                  <Button modifier='quiet' 
                    onClick={this.nextItem.bind(this)} 
                    style={Style.contentRow.col4.arrowIcon.button.style}>
                    <Icon icon={Style.contentRow.col4.arrowIcon.iconRight} 
                      size={Style.contentRow.col4.arrowIcon.size} />
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
    return (
      <Toolbar>
        <div className="left"><BackButton></BackButton></div>
        <div className="center">
          <img src={ToolbarStyle.title.imgs.logo.url} style={ToolbarStyle.title.imgs.logo.style} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon icon={ToolbarStyle.menu.icon} size={ToolbarStyle.menu.size} />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  renderFixed() {
    return (
      <Fab onClick={this.loadListView.bind(this)} position={MapViewStyle.fixedFab.position}>
        <Icon icon={MapViewStyle.fixedFab.icon} />
      </Fab>
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

  handleSearchBox(value) {
    let searchString = value;
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

  drawSingleMarker(lat, lng, color, zIndex, id, textColor) {
    let markerKey = "marker-" + id;
    return (<Marker key = {markerKey} 
             position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} text={MapViewStyle.mapMarker.dotText} 
             textColor={textColor} />);
  }

  createMarkup(text) {
    return {__html: text }; 
  }

  render() {
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
    const markerGray = MapViewStyle.mapMarker.gray;
    const markerRed = MapViewStyle.mapMarker.red;
    const markerDotGray = MapViewStyle.mapMarker.dotgray;
    const markerDotRed = MapViewStyle.mapMarker.dotred;

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
            marker = 
              this.drawSingleMarker(markerInfo.lat, markerInfo.lng, markerRed, topMost, i, markerDotRed);
          }
          else {
            marker = 
              this.drawSingleMarker(markerInfo.lat, markerInfo.lng, markerGray, i, i, markerDotGray);
          }
          markers.push(marker);
        }
      } else {
        let markerInfo = markersInfo[itemCarouselIndex];
        let marker = this.drawSingleMarker(markerInfo.lat, markerInfo.lng, 
          markerRed, 9999, itemCarouselIndex, markerDotRed);
        markers.push(marker);
      }
    }

    let map = (
      <MapContainer initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
        width={MapViewStyle.map.size.width} height={MapViewStyle.map.size.height}>
        {markers}
      </MapContainer>);

    return (
      <Page renderToolbar = {this.renderToolbar.bind(this)}
        renderFixed={this.renderFixed.bind(this)}>
        <div style = {CenterDivStyle}>
          <TopToggleView index = {this.state.segmentIndex} 
            onPostChange = {this.handleAddressFilter.bind(this)} 
            strings = {this.state.strings}/>
          <TopSearchView onChange = {this.handleSearchBox.bind(this)} 
            onClick = {this.handleSearchButton.bind(this)}/> 
          <div style = {MapViewStyle.map.container.style}>
            {map}
          </div>
          <div>
            <FilterCarouselView 
              width = {fullWidth}
              strings = {this.state.strings} 
              items = {this.state.items}
              onFilterClicked = {this.toggleFilterStatus.bind(this)}
            />
          </div>
          <div>
            {placeCarousel}
          </div>
        </div>
      </Page>
    );
  }
}
