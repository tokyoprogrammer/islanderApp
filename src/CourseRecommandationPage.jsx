import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, ListHeader, ProgressCircular, Carousel, CarouselItem, Card, Modal, Col, Row, Fab} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import DetailView from './DetailView';
import MapContainer from './MapContainer';
import Marker from './Marker';
import {ToolbarStyle, CourseStyle, CenterDivStyle} from './Styles';

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
    const serviceKey = process.env.REACT_APP_VISIT_KOREA_API_KEY; 
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
    this.loaded = false;
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
    let cache = JSON.parse(localStorage.getItem("homecourse"));
    if(cache != null) {
      this.setState({items: cache.items, numOfItems: cache.items.length});
      this.setCurrentOverviewAndList(cache.items[0].contentid._text);

      return;
    }    
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

    let cache = JSON.parse(localStorage.getItem("coursecard" + contentId));
    if(cache != null) {
      this.setState({currentOverview: cache.items});
      this.setCurrentDetailLists(contentId);

      return;
    }
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
          (<ListItem key="li-dist" modifier="longdivider"> 
            <b>{this_.state.strings.coursedistance} : </b> {ret.distance._text} 
          </ListItem>) :
          (<ListItem key="li-dist" modifier="longdivider">
            <b>{this_.state.strings.coursedistance} : </b> Unknown 
          </ListItem>) ;
        let listItemForRequiredTime = ret.taketime != null ?
          (<ListItem key="li-time" modifier="longdivider">
            <b>{this_.state.strings.coursetime} : </b> {ret.taketime._text} 
          </ListItem>) :
          (<ListItem key="li-time" modifier="longdivider">
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
      if(!this_.loaded) {
        this_.loaded = true;
        let contentId = localStorage.getItem("coursecontentid");
        let firstIndex = 0;
        for(let i = 0; i < this_.state.items.length; i++) {
          let item = this_.state.items[i];
          if(item.contentid._text == contentId) {
            firstIndex = i;
          }
        }
        this_.setState({isOpen: false, itemCarouselIndex: firstIndex});
      } else {
        this_.setState({isOpen: false});
      }
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
    if(xml.response.body == null) return null;
    if(xml.response.body.items != null) {
      var items = xml.response.body.items.item;
      return items;
    } else {
      return null;
    }
  }

  convertContentId(urlString, contentId) {
    return urlString.replace(this.state.contentIdReplaceString, contentId);
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="center">
          <img src={ToolbarStyle.title.imgs.logo.url} style={ToolbarStyle.title.imgs.logo.style} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon size={ToolbarStyle.menu.size} icon={ToolbarStyle.menu.icon} />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  renderFixed() {
    return (
      <Fab onClick={this.goTopScroll.bind(this)} position={CourseStyle.fab.position}>
        <Icon icon={CourseStyle.fab.icon} />
      </Fab>
    );
  }

  handleCourseChange(e) {
    if(this.overScrolled) {
      this.overScrolled = false;
      this.setState({isOpen: true, currentOverview: "Loading..."});
      let contentId = this.state.items[this.state.itemCarouselIndex].contentid._text;
      this.setCurrentOverviewAndList(contentId);

      return;
    }
    this.setState({itemCarouselIndex: e.activeIndex, isOpen: true, currentOverview: "Loading..."});
    let contentId = this.state.items[e.activeIndex].contentid._text;
    this.setCurrentOverviewAndList(contentId);
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

  drawSingleMarker(lat, lng, color, zIndex, id, textColor) {
    let markerKey = "marker-" + id;
    return (<Marker key = {markerKey} 
             position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} 
             text={CourseStyle.map.marker.dotText} textColor={textColor}/>);
  }
  
  goDetails(contentId) {
    if(contentId == 2473487) contentId = 2554574; 
    // API BUG. 오설록 티 뮤지엄. 
    // Manual correction is NOT A GOOD WAY. 
    // TODO Change This line when we can manage API server.
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
    const arrowIconSize = CourseStyle.carousel.arrow.size;
    const mapCenter = CourseStyle.map.center;
    const mapZoom = CourseStyle.map.zoom;
    const markerGray = CourseStyle.map.marker.gray;
    const markerRed = CourseStyle.map.marker.red;
    const markerDotRed = CourseStyle.map.marker.dotred;
    const markerDotGray = CourseStyle.map.marker.dotgray;

    const grayColor = CourseStyle.star.colors.gray;
    const goldColor = CourseStyle.star.colors.gold;
    const starIconSize = CourseStyle.star.size;
    
    let additionalInfo = this.state.additionalInfo;
    let markers = [];
    if(additionalInfo.length > 0) {
      for(let i = 0; i < additionalInfo.length; i++) {
        let info = additionalInfo[i];
        let lng = info.mapX;
        let lat = info.mapY;
        let marker = null;
        if(i == 0 || i == additionalInfo.length - 1) 
          marker = this.drawSingleMarker(lat, lng, markerRed, i, i, markerDotRed);
        else
          marker = this.drawSingleMarker(lat, lng, markerGray, i, i, markerDotGray);
        markers.push(marker);
      }
    }

    let map = (
      <MapContainer initialCenter={mapCenter} zoom={mapZoom}
        width={CourseStyle.map.size.width} height={CourseStyle.map.size.height} 
        drawLine = {true}>
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
               <div style={CourseStyle.carousel.container.style}>
                 <div className="card">
                   <div className="card__title">
                     {item.title._text}
                   </div>
                   <div className="card__content">
                     <Row>
                       <Col width={CourseStyle.carousel.cols.col1.width}>
                         <Button modifier='quiet' 
                           onClick={this.prevItem.bind(this)} 
                           style={CourseStyle.carousel.arrow.style}>
                           <Icon icon={CourseStyle.carousel.arrow.icons.left} 
                             size={arrowIconSize} />
                         </Button>
                       </Col>
                       <Col width={CourseStyle.carousel.cols.col2.width}>
                         <div>
                           <img src = {item.firstimage == null ? "img/noimage.png" : item.firstimage._text} 
                             style={CourseStyle.carousel.cols.col2.style} />
                         </div>
                       </Col>
                       <Col width={CourseStyle.carousel.cols.col3.width}>
                         <Button modifier='quiet' 
                           onClick={this.nextItem.bind(this)} 
                           style={CourseStyle.carousel.arrow.style}>
                           <Icon icon={CourseStyle.carousel.arrow.icons.right} 
                             size={arrowIconSize} />
                         </Button>
                       </Col>
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
            <div style={CourseStyle.modal.style}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
 
        <div id="top">
          <div style = {CourseStyle.map.style}>
            {map}
          </div>
          <div>
            {courseCarousel}
          </div>
          <div style={CourseStyle.list.style} id="content">
            <List>
              <ListHeader>{this.state.strings.courseinfo}</ListHeader>
              <ListItem key="li-overview" expandable={true} modifier="longdivider">
                <b>{this.state.strings.courseoverview} : </b><p>{this.state.strings.taptoexpand}</p>
                <div className="expandable-content">
                  {this.state.currentOverview}
                </div>
              </ListItem>
              <ListItem key="li-course-list" modifier="longdivider">
                <List modifier="inset" style={CourseStyle.list.inset.style}>
                  <ListHeader>{this.state.strings.course}</ListHeader> 
                  {this.state.courseDetails.map((item, index) => (
                    <ListItem key={"li-course-list-item" + index} 
                      style={CourseStyle.list.inset.item.style} modifier="longdivider">
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
                          style={Object.assign({
                            color: this.state.favorites.includes(item.subcontentid._text) ? 
                              goldColor : grayColor
                          }, CourseStyle.star.btn.style)}
                          onClick={this.toggleFavorite.bind(this, item.subcontentid._text)}>
                          <Icon icon={CourseStyle.star.icon} size={starIconSize}/>
                        </Button>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </ListItem>
              {this.state.detailListItems}
            </List>
            <div style={CourseStyle.details.title.style}>
              <h4><b>{this.state.strings.godetails}</b></h4>
            </div>
            {this.state.courseDetails.map((item, index) => (
              <Card key={"detail-card" + index}>
                {item.subdetailimg != null ?
                (<img src={item.subdetailimg._text} style={CourseStyle.details.card.imgs.style} />) :
                (<img src="img/noimage.png" style={CourseStyle.details.card.imgs.style} />)}
                <div className="card__title">
                  <Row>
                    <Col width={CourseStyle.details.cols.col1.width}>  
                      <h2 style={CourseStyle.details.card.title.style}>
                        {item.subname != null ? item.subname._text : null}
                      </h2>
                    </Col>
                    <Col width={CourseStyle.details.cols.col2.width}>
                      <Button modifier='quiet' 
                        style={Object.assign({
                          color: this.state.favorites.includes(item.subcontentid._text) ? 
                            goldColor : grayColor
                        }, CourseStyle.star.btn.style)}
                        onClick={this.toggleFavorite.bind(this, item.subcontentid._text)}>
                        <Icon icon={CourseStyle.star.icon} size={starIconSize}/>
                      </Button>
                    </Col>
                  </Row> 
                </div>
                <div className="card__content">
                  {item.subdetailoverview != null? item.subdetailoverview._text : null}
                </div>
                <Button style={CourseStyle.details.btn.style}
                  onClick={this.goDetails.bind(this, item.subcontentid._text)} >
                  <div style={CenterDivStyle}>
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
