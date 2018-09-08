import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, ProgressCircular, Carousel, CarouselItem, Card, Modal, Col, Row} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import MapContainer from './MapContainer';

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

    const fixedAreaCode = 39; /* jeju island area code */
    const fixedContentType = 25;
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    const contentId = "__CONTENTID__";

    this.state = {
      contentIdReplaceString: contentId,
      urlForList: "http://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/areaBasedList?ServiceKey=" + serviceKey + 
        "&contentTypeId=" + fixedContentType + "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=C01&cat2=&cat3=&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide" + 
        "&arrange=A&numOfRows=1000&pageNo=1",
      urlForOverview: "http://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailCommon?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&" + 
        "firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y",
      urlForCourseInfo: "http://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailIntro?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&introYN=Y",
      urlForDetailInfo: "http://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailInfo?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&listYN=Y",
      itemCarouselIndex: 0,
      numOfItems: 0,
      items: [],
      isOpen: true,
      currentOverview: "",
      strings: strings,
      detailListItems: []
    };
    this.overScrolled = false;
    this.readLists();
  }

  readLists() {
    var this_ = this;
    
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        this_.setState({items: ret, numOfItems: ret.length});
        resolve(ret[0]);
      }
      xhr.onerror = function() {
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
          (<ListItem><b>{this_.state.strings.coursedistance} : </b> {ret.distance._text} </ListItem>) :
          (<ListItem><b>{this_.state.strings.coursedistance} : </b> Unknown </ListItem>) ;
        let listItemForRequiredTime = ret.taketime != null ?
          (<ListItem><b>{this_.state.strings.coursetime} : </b> {ret.taketime._text} </ListItem>) :
          (<ListItem><b>{this_.state.strings.coursetime} : </b> Unknown </ListItem>) ;
        let listArray = [];
        listArray.push(listItemForDistance);
        listArray.push(listItemForRequiredTime);
        this_.setState({detailListItems: listArray}); 

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.convertContentId(this_.state.urlForCourseInfo, contentId));
      xhr.send(null);
    }).then(function(result) {
      // success callback
      this_.setState({isOpen: false});
    });
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

    const marginTopForArrow = "80px";

    let map = (
      <MapContainer initialCenter={mapCenter} zoom={mapZoom} google={this.props.google}
        width="100vw" height = "35vh">
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
                             style={{width: "100%"}} />
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
       renderModal={() => (
          <Modal
            isOpen={this.state.isOpen}>
            <div style={{width: "100%", display: "inline-block", position: "relative"}}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
 
        <div style={centerDiv}>
          <div style = {{marginTop: '1%', marginBottom: '1%'}}>
            {map}
          </div>
          <div>
            {courseCarousel}
          </div>
          <div style={{marginLeft: "1%", marginRight: "1%"}}>
            <List>
              {this.state.detailListItems}
            </List>
          </div>
       </div>
      </Page>
    );
  }
}
