import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, ListHeader, ProgressCircular, Carousel, CarouselItem, Card, Modal, Col, Row, Fab} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import DetailView from './DetailView';
import MapContainer from './MapContainer';
import Marker from './Marker';

export default class CourseRecommandationPage extends React.Component {
  constructor(props) {
    super(props);

    let serviceLang = "";
    let lang = localStorage.getItem("lang");
    if(lang == 'kr') {
      serviceLang = "KorService";
    } else {
      serviceLang = "EngService";
    }

    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if(favorites == null) {
      favorites = [];
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    const fixedAreaCode = 39; /* jeju island area code */
    const fixedContentType = 25;
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    const contentId = "__CONTENTID__";

    this.state = {
      contentIdReplaceString: contentId,
      urlForAllList: "https://api.visitkorea.or.kr/openapi/service/rest/"+ serviceLang + 
        "/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC&" + 
        "MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=2000&pageNo=1",
      urlForList: "https://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/areaBasedList?ServiceKey=" + serviceKey + 
        "&contentTypeId=" + fixedContentType + "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=C01&cat2=&cat3=&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide" + 
        "&arrange=A&numOfRows=1000&pageNo=1",
      urlForOverview: "https://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailCommon?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&" + 
        "firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y",
      urlForCourseInfo: "https://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailIntro?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&introYN=Y",
      urlForDetailInfo: "https://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailInfo?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&listYN=Y",
      itemCarouselIndex: 0,
      numOfItems: 0,
      allSightList: [],
      items: [],
      isOpen: true,
      lang: lang,
      currentOverview: "",
      strings: strings,
      favorites: favorites,
      detailListItems: [],
      courseDetails: [],
      additionalInfo: [] // map info, content type info
    };
    this.overScrolled = false;
    this.readLists();
  }

  componentDidUpdate(prevProps) {
    let favorites = localStorage.getItem('favorites');
    if(favorites != JSON.stringify(this.state.favorites)) {
      favorites = JSON.parse(favorites);
      
      this.setState({favorites: favorites});
    } 
  }

  toggleFavorite(key) {
    this.stopPropagation = true;
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

    this.setState({favorites: favoritesCopy});
  }

  readLists() {
    let cache = JSON.parse(localStorage.getItem("itemsAllSights" + this.state.lang));
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
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        this_.setState({allSightList: cache.items});
        this_.readCourseList();
      });

    } else {
      this.readListsFromWeb();
    }
  }
  
  readListsFromWeb() {
    var this_ = this;
    
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        this_.setState({allSightList: ret});
        let cache = {
          createdDateTime: new Date(),
          items: ret
        };
        let cacheName = "itemsAllSights" + this_.state.lang;
        localStorage.setItem(cacheName, JSON.stringify(cache));
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        this_.setState({currentOverview: this_.state.strings.oops, isOpen: false});
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForAllList);
      xhr.send(null);
    }).then(function(result) {
      this_.readCourseList();
    });
  }

  readCourseList() {
    var this_ = this;
    
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        this_.setState({items: ret, numOfItems: ret.length});
        resolve(ret[0]);
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        this_.setState({currentOverview: this_.state.strings.oops, isOpen: false});
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForList);
      xhr.send(null);
    }).then(function(result) {
      if(result.contentid == null) {
        this_.setState({currentOverview: this_.state.strings.oops, isOpen: false});
      } else {
        this_.setCurrentOverviewAndList(result.contentid._text);
      }
    });
  }

  setCurrentOverviewAndList(contentId) {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        if(ret != null && ret.overview != null)
          this_.setState({currentOverview: ret.overview._text});
        else
          this_.setState({currentOverview: this_.state.strings.oops});

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.convertContentId(this_.state.urlForOverview, contentId));
      xhr.send(null);
    }).then(function(result) {
      // success callback
      this_.setCurrentDetailLists(contentId);
    });
  }

  setCurrentDetailLists(contentId) {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        let listItemForDistance = ret.distance != null ?
          (<ListItem key="li-dist"> 
            <b>{this_.state.strings.coursedistance} : </b> {ret.distance._text} 
          </ListItem>) :
          (<ListItem key="li-dist">
            <b>{this_.state.strings.coursedistance} : </b> Unknown 
          </ListItem>) ;
        let listItemForRequiredTime = ret.taketime != null ?
          (<ListItem key="li-time">
            <b>{this_.state.strings.coursetime} : </b> {ret.taketime._text} 
          </ListItem>) :
          (<ListItem key="li-time">
            <b>{this_.state.strings.coursetime} : </b> Unknown 
          </ListItem>) ;
        let listArray = [];
        listArray.push(listItemForDistance);
        listArray.push(listItemForRequiredTime);
        this_.setState({detailListItems: listArray}); 

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.convertContentId(this_.state.urlForCourseInfo, contentId));
      xhr.send(null);
    }).then(function(result) {
      // success callback
      this_.setCurrentCourseDetailLists(contentId);
    });
  }  

  setCurrentCourseDetailLists(contentId) {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        let additional = this_.makeAdditionalList(ret);
        this_.setState({courseDetails: ret, additionalInfo: additional});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.convertContentId(this_.state.urlForDetailInfo, contentId));
      xhr.send(null);
    }).then(function(result) {
      // success callback
      this_.setState({isOpen: false});
    });
  }  

  makeAdditionalList(courseList) {
    let allList = this.state.allSightList;
    let additionalList = [];
    for(let i = 0; i < courseList.length; i++) {
      let course = courseList[i];
      for(let j = 0; j < allList.length; j++) {
        let sight = allList[j];
        if(sight.contentid._text == course.subcontentid._text) {
          let item = {
            title: sight.title._text,
            contentId : sight.contentid._text,
            contentTypeId: sight.contenttypeid._text,
            mapX: sight.mapx._text,
            mapY: sight.mapy._text
          };
          additionalList.push(item);
          break;
        }
      }
    }

    return additionalList;
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
    return items;
  }

  convertContentId(urlString, contentId) {
    return urlString.replace(this.state.contentIdReplaceString, contentId);
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    const imgStyle= {
      height: '15px',
      marginTop: '5%'
    };

    return (
      <Toolbar>
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

  renderFixed() {
    return (
      <Fab onClick={this.goTopScroll.bind(this)} position="bottom right">
        <Icon icon='md-format-valign-top' />
      </Fab>
    );
  }

  handleCourseChange(e) {
    if(this.overScrolled) {
      this.overScrolled = false;
      this.setState({});
      return;
    }
    var this_ = this;
    var contentId = this.state.items[e.activeIndex].contentid._text;
    this.setCurrentOverviewAndList(contentId);
    this.setState({itemCarouselIndex: e.activeIndex, isOpen: true, currentOverview: "Loading..."});
  }

  overScroll() {
    this.overScrolled = true;

    if(this.state.itemCarouselIndex == this.state.numOfItems - 1) {
      // reached to the end
      this.nextItem();
    } else {
      // reached to the first
      this.prevItem();
    }
  }

  prevItem() {
    let change = this.state.itemCarouselIndex - 1 < 0 ?
      this.state.numOfItems - 1 :
      this.state.itemCarouselIndex - 1;
    this.setState({itemCarouselIndex: change});
  }

  nextItem() {
    let change = this.state.itemCarouselIndex + 1 > this.state.numOfItems - 1 ?
      0 :
      this.state.itemCarouselIndex + 1;
    this.setState({itemCarouselIndex: change});
  }

  markerClicked(e, id) {
  } 

  drawSingleMarker(lat, lng, color, zIndex, id) {
    let markerKey = "marker-" + id;
    return (<Marker key = {markerKey} 
             position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} text="%E2%80%A2" />);
  }
  
  goDetails(contentId) {
    localStorage.setItem("contentId", contentId);
    let additional = this.state.additionalInfo;
    for(let i = 0; i < additional.length; i++) {
      let item = additional[i];
      if(item.contentId == contentId) { 
        localStorage.setItem("contentTypeId", item.contentTypeId);
        break; 
      }
    }
    this.props.navigator.pushPage({ 
      component: DetailView 
    });
  }

  goTopScroll(elementId) {
    let elmnt = document.getElementById("top");
    elmnt.scrollIntoView(); 
  }

  render() {
    const centerDiv = {
      textAlign: 'center'
    };

    const arrowIconSize = {
      default: 30,
      material: 28
    };

    const mapCenter = {
      lat: 33.356432,
      lng: 126.5268767
    };

    const mapZoom = 9;

    const markerGray = 'C0C0C0';
    const marginTopForArrow = "80px";

    const grayColor = "#D3D3D3";
    const goldColor = "#FFD700";
    const starIconSize = {
      default: 30,
      material: 28
    };
    
    const markerChrimsonRed = 'DC134C'
    let additionalInfo = this.state.additionalInfo;
    let markers = [];
    if(additionalInfo.length > 0) {
      for(let i = 0; i < additionalInfo.length; i++) {
        let info = additionalInfo[i];
        let lng = info.mapX;
        let lat = info.mapY;
        let marker = null;
        if(i == 0 || i == additionalInfo.length - 1) 
          marker = this.drawSingleMarker(lat, lng, markerChrimsonRed, i, i);
        else
          marker = this.drawSingleMarker(lat, lng, markerGray, i, i);
        markers.push(marker);
      }
    }

    let map = (
      <MapContainer initialCenter={mapCenter} zoom={mapZoom}
        width="100vw" height = "35vh" drawLine = {true}>
        {markers}
      </MapContainer>
    );
    
    let fullWidth = window.innerWidth + "px";
    let courseCarousel = this.state.items.length <= 0 ? (<ProgressCircular indeterminate />) :
      (<Carousel
         style={{width: fullWidth}}
         onPostChange={this.handleCourseChange.bind(this)}
         onOverscroll={this.overScroll.bind(this)} 
         index = {this.state.itemCarouselIndex}
         autoScrollRatio={0.3}
         autoScroll overscrollable swipeable>
         {this.state.items.map((item, index) => (
           <CarouselItem key={"carousel-" + index}>
             {this.state.itemCarouselIndex - 1 <= index && this.state.itemCarouselIndex + 1 >= index ?
               <div style={{padding: "1px 0 0 0", textAlign: "center"}}>
                 <div className="card">
                   <div className="card__title">
                     {item.title._text}
                   </div>
                   <div className="card__content">
                     <Row style={{width: "100%"}}>
                       <Col width="5%">
                         <Button modifier='quiet' 
                           onClick={this.prevItem.bind(this)} 
                           style={{width: '100%', padding: "5%", marginTop: marginTopForArrow}}>
                           <Icon icon='md-chevron-left' size={arrowIconSize} />
                         </Button>
                       </Col>
                       <Col width="90%">
                         <div>
                           <img src = {item.firstimage == null ? "img/noimage.png" : item.firstimage._text} 
                             style={{width: "100%", height: "200px"}} />
                         </div>
                       </Col>
                       <Col width="5%">
                         <Button modifier='quiet' 
                           onClick={this.nextItem.bind(this)} 
                           style={{width: '100%', padding: "5%", marginTop: marginTopForArrow}}>
                           <Icon icon='md-chevron-right' size={arrowIconSize} />
                         </Button>
                       </Col>
                     </Row>
                     <Row style={{width: "100%"}}>
                       <p>
                       </p>
                     </Row>
                   </div>
                 </div>
               </div> : 
               <div>
                 <Card>
                   <div className="title center">Loading...</div>
                   <div className="content">Please wait...</div>
                 </Card>
               </div>}
           </CarouselItem>
         ))}
       </Carousel>);
 
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)} 
        renderFixed={this.renderFixed.bind(this)}
        renderModal={() => (
          <Modal
            isOpen={this.state.isOpen}>
            <div style={{width: "100%", display: "inline-block", position: "relative"}}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
 
        <div id="top">
          <div style = {{marginTop: '1%', marginBottom: '1%'}}>
            {map}
          </div>
          <div>
            {courseCarousel}
          </div>
          <div style={{marginLeft: "1%", marginRight: "1%"}} id="content">
            <List>
              <ListHeader>{this.state.strings.courseinfo}</ListHeader>
              <ListItem key="li-overview" expandable={true}>
                <b>{this.state.strings.courseoverview} : </b><p>{this.state.strings.taptoexpand}</p>
                <div className="expandable-content">
                  {this.state.currentOverview}
                </div>
              </ListItem>
              <ListItem key="li-course-list">
                <List modifier="inset" style={{width: "100%"}}>
                  <ListHeader>{this.state.strings.course}</ListHeader> 
                  {this.state.courseDetails.map((item, index) => (
                    <ListItem key={"li-course-list-item" + index} style={{height: "60px"}}>
                      {item.subdetailimg != null ?
                      (<div className="left">
                        <img src={item.subdetailimg._text} className = "list-item__thumbnail"/>
                      </div>) : 
                      (<div className="left">
                        <img src="img/noimage.png" className = "list-item__thumbnail"/>
                      </div>)}
                      {item.subname != null ? (
                        <div className="center"> 
                          {item.subname._text}
                        </div>) : null}
                      <div className='right'>
                        <Button modifier='quiet' 
                          style={{
                            width: '100%', 
                            textAlign: "center", 
                            color: this.state.favorites.includes(item.subcontentid._text) ? 
                              goldColor : grayColor
                          }}
                          onClick={this.toggleFavorite.bind(this, item.subcontentid._text)}>
                          <Icon icon='md-star' size={starIconSize}/>
                        </Button>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </ListItem>
              {this.state.detailListItems}
            </List>
            <div style={{margin: '1%'}}><h4><b>{this.state.strings.godetails}</b></h4></div>
            {this.state.courseDetails.map((item, index) => (
              <Card key={"detail-card" + index}>
                {item.subdetailimg != null ?
                (<img src={item.subdetailimg._text} style={{width: "100%"}} />) :
                (<img src="img/noimage.png" style={{width: "100%"}} />)}
                <div className="card__title">
                  <Row>
                    <Col width="80%">  
                      <h2 style={{margin: "1%"}}>
                        {item.subname != null ? item.subname._text : null}
                      </h2>
                    </Col>
                    <Col width="20%">
                      <Button modifier='quiet' 
                        style={{
                          width: '100%', 
                          textAlign: "center", 
                          color: this.state.favorites.includes(item.subcontentid._text) ? 
                            goldColor : grayColor
                        }}
                        onClick={this.toggleFavorite.bind(this, item.subcontentid._text)}>
                        <Icon icon='md-star' size={starIconSize}/>
                      </Button>
                    </Col>
                  </Row> 
                </div>
                <div className="card__content">
                  {item.subdetailoverview != null? item.subdetailoverview._text : null}
                </div>
                <Button style={{width: "80%", marginLeft: "10%", marginRight: "10%"}}
                  onClick={this.goDetails.bind(this, item.subcontentid._text)} >
                  <div style={centerDiv}>
                    {this.state.strings.moredetails}
                  </div>
                </Button>
              </Card>
            ))} 
          </div>
        </div>
      </Page>
    );
  }
}
