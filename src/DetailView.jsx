import React from 'react';
import ReactDOM from 'react-dom';

import LocalizedStrings from 'react-localization';

import {Toolbar, ToolbarButton, Page, Button, BackButton, Carousel, CarouselItem, Icon, ProgressCircular, ListItem, List, Card, Row, Col, Modal} from 'react-onsenui';

import {notification} from 'onsenui';

import GooglePlaceImageView from './GooglePlaceImageView';
import './imagefit.css';
import {ToolbarStyle, DetailViewStyle} from './Styles';

export default class DetailView extends React.Component {
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

    const serviceKey = process.env.REACT_APP_VISIT_KOREA_API_KEY; 
 
    let contentId = localStorage.getItem("contentId");
    let contentTypeId = localStorage.getItem("contentTypeId");
 
    this.state = {
      urlForContentDetailCommon: "https://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/detailCommon?ServiceKey=" + 
        serviceKey + "&contentTypeId=" + contentTypeId + "&contentId=" + contentId + 
        "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y" + 
        "&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&" +
        "overviewYN=Y&transGuideYN=Y",
      urlForContentDetailIntro: "https://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/detailIntro?ServiceKey=" +
        serviceKey + "&contentTypeId=" + contentTypeId + "&contentId=" + contentId +
        "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&introYN=Y",
      urlForDetailImage: "https://api.visitkorea.or.kr/openapi/service/rest/" +
        serviceLang + "/detailImage?ServiceKey=" +
        serviceKey + "&contentTypeId=" + 
        contentTypeId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&contentId=" + 
        contentId + "&imageYN=Y",
      urlForDetailImageMenu: "https://api.visitkorea.or.kr/openapi/service/rest/" +
        serviceLang + "/detailImage?ServiceKey=" +
        serviceKey + "&contentTypeId=" + contentTypeId + 
        "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&contentId=" + 
        contentId + "&imageYN=N",
      strings: strings,
      itemDetailCommon: null,
      itemDetailIntro: null,
      itemDetailImage: [],
      itemDetailImageMenu: [],
      favorites: favorites,
      contentId: contentId,
      isOpen: false,
      imageForModal: "",
      counter: 0,
      images: []
    };
    
    strings.setLanguage(lang);
    this.readDetailCommon();
    this.readDetailIntro();
    this.readDetailImage();
    this.readDetailImageMenu();
  }

  readDetailCommon() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        this_.setState({itemDetailCommon: xml.response.body.items.item});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Load Detail Common failed'));
      }
      xhr.open('GET', this_.state.urlForContentDetailCommon);
      xhr.send(null);
    });
  }

  readDetailIntro() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        this_.setState({itemDetailIntro: xml.response.body.items.item});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        reject(new TypeError('Load Detail Intro failed'));
      }
      xhr.open('GET', this_.state.urlForContentDetailIntro);
      xhr.send(null);
    });
  }

  readDetailImage() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        if(xml.response.body.items.item != null) 
          this_.setState({itemDetailImage: xml.response.body.items.item});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Load Detail Image failed'));
      }
      xhr.open('GET', this_.state.urlForDetailImage);
      xhr.send(null);
    });
  }

  readDetailImageMenu() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        if(xml.response.body.totalCount._text > 1) {
          this_.setState({itemDetailImageMenu: xml.response.body.items.item});
        }
        else {
          let imageURL = xml.response.body.items.item;
          if(xml.response.body.items.item != null)
            this_.setState({itemDetailImageMenu: [imageURL]});
	}
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Load Detail ImageMenu failed'));
      }
      xhr.open('GET', this_.state.urlForDetailImageMenu);
      xhr.send(null);
    });
  }
  showMenu() {
    this.props.showMenu();
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

  createMarkup(text) {
    return {__html: text }; 
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

  openModal(imageSrc) {
    this.setState({isOpen: true, imageForModal: imageSrc});
  }

  handleChange(e) {
    this.setState({counter: e.activeIndex});
  }

  renderCommon() {
    if(this.state.itemDetailCommon != null) {
      const Styles = DetailViewStyle.common;
      let carouselItems = [];
      let title = this.state.itemDetailCommon.title == null ? 
        "" : this.state.itemDetailCommon.title._text;
      let overview = this.state.itemDetailCommon.overview == null ? 
        "" : this.state.itemDetailCommon.overview._text;

      let carouselItem = null;
      let images = [];

      let coverImage = this.state.itemDetailCommon.firstimage != null ? (
        <CarouselItem>
          <img src={this.state.itemDetailCommon.firstimage._text}
            className="image-cover"
            style={Styles.image.style} 
            onClick={this.openModal.bind(this, 
              this.state.itemDetailCommon.firstimage._text)}/>
         </CarouselItem>) : null;

      if(coverImage != null) images.push(coverImage);

      for(let i = 0; i < this.state.itemDetailImage.length; i++) {
        let item = this.state.itemDetailImage[i];
        let imageURL = item.originimgurl._text;
        let imageItem = (
          <CarouselItem>
            <img src={imageURL}
              className="image-cover"
              style={Styles.image.style} 
              onClick={this.openModal.bind(this, imageURL)}/>
          </CarouselItem>
        );
        images.push(imageItem);
      }

      for(let i = 0; i < this.state.itemDetailImageMenu.length; i++) {
        let item = this.state.itemDetailImageMenu[i];
        let imageURL = item.originimgurl._text;
        let imageItem = (
          <CarouselItem>
            <img src={imageURL}
              className="image-cover"
              style={Styles.image.style}
              onClick={this.openModal.bind(this, imageURL)}/>
          </CarouselItem>
        );
        images.push(imageItem);
      }

      let imageSrc = images.length < 1 ? 
        (<GooglePlaceImageView 
           maxWidth={Styles.image.google.width} 
           maxHeight={Styles.image.google.height} 
           placeTitle={this.state.itemDetailCommon.title._text} 
           listThumbnail={false} multi={true}
           imageOnClick={this.openModal.bind(this)} />) : 
	(<Carousel swipeable autoScroll overscrollable autoScrollRatio={0.5} 
           index={this.state.counter}
           onPostChange={this.handleChange.bind(this)}>
           {images}
         </Carousel>);

      const grayColor = Styles.star.color.gray;
      const goldColor = Styles.star.color.gold;
      const starIconSize = Styles.star.size;

      let contentId = this.state.contentId;
      let starColor = grayColor;
      let favorites = this.state.favorites;

      for(let j = 0; j < favorites.length; j++) {
        if(favorites[j] == contentId) {
          starColor = goldColor; // change star color
          break;
        }
      }

      let commonField = (
        <div>
          <Card>
            <div style={Styles.image.indicator.container.style}>
              {images.map((item, index) => (
                <span key={"imagedot-" + index} style={Styles.image.indicator.dot.style}>
                  {images.length > 1 ? this.state.counter == index ? '\u25CF' : '\u25CB' : null}
                </span>
              ))}
            </div>
            <div>{imageSrc}</div>
            <div className="title left">
              <Row>
                <Col width={Styles.card.title.width}>  
                  <h2 style={Styles.card.title.style}>{title}</h2>
                </Col>
                <Col width={Styles.card.star.width}>
                <Button modifier='quiet' 
                  style={Object.assign({color: starColor}, Styles.card.star.style)}
                  onClick={this.toggleFavorite.bind(this, contentId)}>
                  <Icon icon={Styles.card.star.icon} size={starIconSize}/>
                </Button>
                </Col>
              </Row> 
            </div>
            <div className="content">
              <div dangerouslySetInnerHTML={this.createMarkup(overview)} />
           </div>
          </Card>
        </div>
      );
      
      let listField = this.renderDetail();

      let map = null;

      if(this.state.itemDetailCommon.mapy != null && this.state.itemDetailCommon.mapx != null) {
        let lat = this.state.itemDetailCommon.mapy._text;
        let lng = this.state.itemDetailCommon.mapx._text;
      
        const mapCenter = {
          lat: lat,
          lng: lng
        };
        const zoom = Styles.map.zoom;
        const mapSize = Styles.map.size;

        const google = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
        let mapURL = "https://maps.googleapis.com/maps/api/staticmap?" + 
          "center=" + lat + "," + lng + "&zoom=" + zoom + 
          "&size=" + mapSize + "&maptype=roadmap&markers=color:red%7C" + 
          lat + "," + lng + "&key=" + google;
        map = (<img src = {mapURL} style={Styles.map.style} />);
      }
 
      return {commonField: commonField, listField: listField, map: map}; 
    }
    else return {commonField: null, listField: null, map: null};
  }

  renderCultureDetails(){
    let ret = [];
    let infocenter = this.state.itemDetailIntro.infocenterculture == null ?
      null :
      (<ListItem key="li-infocenter">
        <b>{this.state.strings.infocenter + " : "}</b>
        <p>{this.state.itemDetailIntro.infocenterculture._text}</p>
      </ListItem>);
    ret.push(infocenter);
    let worktime = this.state.itemDetailIntro.usetimeculture  == null ?
      null :
      this.state.itemDetailIntro.usetimeculture._text == null ?
        null :
        (<ListItem key="li-workingtime">
          <b>{this.state.strings.workingtime + " : "}</b>
          <p dangerouslySetInnerHTML =
            {this.createMarkup(this.state.itemDetailIntro.usetimeculture._text)}></p>
        </ListItem>);
    ret.push(worktime);
    let holiday = this.state.itemDetailIntro.restdateculture  == null ?
      null :
      (<ListItem key="li-holiday">
        <b>{this.state.strings.holiday + " : "}</b> 
        <p dangerouslySetInnerHTML = 
          {this.createMarkup(this.state.itemDetailIntro.restdateculture._text)}></p>
      </ListItem>);
    ret.push(holiday);
    let usefee = this.state.itemDetailIntro.usefee  == null ?
      null :
      this.state.itemDetailIntro.usefee._text == null ?
        null :
        (<ListItem key="li-usefee">
        <b>{this.state.strings.usefee + " : "}</b>
        <p dangerouslySetInnerHTML = 
          {this.createMarkup(this.state.itemDetailIntro.usefee._text)}></p>
      </ListItem>);
    ret.push(usefee);

    const Styles = DetailViewStyle.list;

    let iconSize = Styles.icon.style;
    let smoking = this.state.itemDetailIntro.smoking == null ? 
      null : 
      this.state.itemDetailIntro.smoking._text;
    let smokingIcon = smoking != null && 
      (smoking.includes("Non") || 
      smoking.includes("금연")) ? 
        (<img src={Styles.icon.smoking-ban} style={iconSize}/>) : null;
    let creditcard = this.state.itemDetailIntro.chkcreditcardculture == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcardculture._text;
    let creditCardIcon = creditcard != null && creditcard.includes("가능") ?
      (<img src={Styles.icon.creditcard} style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parkingculture == null ? 
      null : 
      this.state.itemDetailIntro.parkingculture._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || 
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src={Styles.icon.parking} style={iconSize} />) : null;
    let etc = (
      <ListItem key="li-icons">
        {smokingIcon}
        {creditCardIcon}
        {parkingIcon}
      </ListItem>
    );
    ret.push(etc);

    return ret;
  }

  renderRestaurantDetails() {
    let ret = [];
    let worktime = this.state.itemDetailIntro.opentimefood == null ? 
      null : 
      (<ListItem key="li-workingtime">
        <b>{this.state.strings.workingtime + " : " }</b>
        <p dangerouslySetInnerHTML = {this.createMarkup(this.state.itemDetailIntro.opentimefood._text)}>
        </p>
      </ListItem>);
    ret.push(worktime);
    let holiday = this.state.itemDetailIntro.restdatefood == null ? 
      null : 
      (<ListItem key="li-holiday">
        <b>{this.state.strings.holiday + " : "}</b> 
        <p dangerouslySetInnerHTML = 
          {this.createMarkup(this.state.itemDetailIntro.restdatefood._text)}></p>
      </ListItem>);
    ret.push(holiday);
    let firstmenu = this.state.itemDetailIntro.firstmenu == null ? 
      null : 
      (<ListItem key="li-firstmenu">
        <b>{this.state.strings.firstmenu + " : "}</b>
        <p dangerouslySetInnerHTML = {this.createMarkup(this.state.itemDetailIntro.firstmenu._text)}>
        </p>
      </ListItem>);
    ret.push(firstmenu);
    let treatmenu = this.state.itemDetailIntro.treatmenu == null ? 
      null : 
      (<ListItem key="li-treatmenu">
        <b>{this.state.strings.treatmenu + " : "}</b>
        <p dangerouslySetInnerHTML = {this.createMarkup(this.state.itemDetailIntro.treatmenu._text)}>
        </p>
      </ListItem>);
    ret.push(treatmenu);
    
    const Styles = DetailViewStyle.list;

    let iconSize = Styles.icons.style;
    let smoking = this.state.itemDetailIntro.smoking == null ? 
      null : 
      this.state.itemDetailIntro.smoking._text;
    let smokingIcon = smoking != null && (smoking.includes("Non") || smoking.includes("금연")) ? 
      (<img src={Styles.icons.nosmoking} style={iconSize}/>) : null;
    let creditcard = this.state.itemDetailIntro.chkcreditcardfood == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcardfood._text;
    let creditCardIcon = creditcard != null && creditcard.includes("가능") ?
      (<img src={Styles.icons.creditcard} style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parkingfood == null ? 
      null : 
      this.state.itemDetailIntro.parkingfood._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || 
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src={Styles.icons.parking} style={iconSize} />) : null;

    let reservation = this.state.itemDetailIntro.reservationfood == null ? 
      null : 
      this.state.itemDetailIntro.reservationfood._text;

    let etc = (
      <ListItem key="li-icons">
        {smokingIcon}
        {creditCardIcon}
        {parkingIcon}
      </ListItem>
    );
    ret.push(etc);

    return ret;
  }
  
  renderFestivalDetails(){
    let ret = [];
    let sponsor = this.state.itemDetailIntro.sponsor2 == null ?
      null : 
      this.state.itemDetailIntro.sponsor2._text == null ?
        null :
        (<ListItem key="li-sponsor">
          <b>{this.state.strings.sponsor + " : "}</b>
          <p>{this.state.itemDetailIntro.sponsor2._text}</p>
        </ListItem>);
    ret.push(sponsor);
    let sponsorTel = this.state.itemDetailIntro.sponsortel == null ?
      null : 
      this.state.itemDetailIntro.sponsortel._text == null ?
        null :
        (<ListItem key="li-sponsorTel">
          <b>{this.state.strings.sponsortel + " : "}</b>
          <p>{this.state.itemDetailIntro.sponsortel._text}</p>
        </ListItem>);
    ret.push(sponsorTel);
    let eventStartDate = this.state.itemDetailIntro.eventstartdate == null ?
      null : 
      this.state.itemDetailIntro.eventstartdate._text == null ?
        null :
        (<ListItem key="li-eventStartDate">
          <b>{this.state.strings.eventstartdate + " : "}</b>
          <p>{this.state.itemDetailIntro.eventstartdate._text}</p>
        </ListItem>);
    ret.push(eventStartDate);
    let eventEndDate = this.state.itemDetailIntro.eventenddate == null ?
      null : 
      this.state.itemDetailIntro.eventenddate._text == null ?
        null :
        (<ListItem key="li-eventEndDate">
          <b>{this.state.strings.eventenddate + " : "}</b>
          <p>{this.state.itemDetailIntro.eventenddate._text}</p>
        </ListItem>);
    ret.push(eventEndDate);
    let playTime = this.state.itemDetailIntro.playtime == null ?
      null : 
      this.state.itemDetailIntro.playtime._text == null ?
        null :
        (<ListItem key="li-playTime">
          <b>{this.state.strings.playtime + " : "}</b>
          <p>{this.state.itemDetailIntro.playtime._text}</p>
        </ListItem>);
    ret.push(playTime);
    let eventPlace = this.state.itemDetailIntro.eventplace == null ?
      null : 
      this.state.itemDetailIntro.eventplace._text == null ?
        null :
        (<ListItem key="li-eventPlace">
          <b>{this.state.strings.eventplace + " : "}</b>
          <p>{this.state.itemDetailIntro.eventplace._text}</p>
        </ListItem>);
    ret.push(eventPlace);
    let spendTimeFestival = this.state.itemDetailIntro.spendtimefestival == null ?
      null : 
      this.state.itemDetailIntro.spendtimefestival._text == null ?
        null :
        (<ListItem key="li-spendTimeFestival">
          <b>{this.state.strings.spendtimefestival + " : "}</b>
          <p>{this.state.itemDetailIntro.spendtimefestival._text}</p>
	  </ListItem>);
    ret.push(spendTimeFestival);
    let ageLimit = this.state.itemDetailIntro.agelimit == null ?
      null : 
      this.state.itemDetailIntro.agelimit._text == null ?
        null :
        (<ListItem key="li-ageLimit">
          <b>{this.state.strings.agelimit + " : "}</b>
          <p>{this.state.itemDetailIntro.agelimit._text}</p>
        </ListItem>);
    ret.push(ageLimit);
    let placeInfo = this.state.itemDetailIntro.placeinfo == null ?
      null : 
      this.state.itemDetailIntro.placeinfo._text == null ?
        null :
        (<ListItem key="li-placeInfo">
          <b>{this.state.strings.placeinfo + " : "}</b>
	      <p dangerouslySetInnerHTML = 
            {this.createMarkup(this.state.itemDetailIntro.placeinfo._text)}></p>
        </ListItem>);
    ret.push(placeInfo);
    return ret;
  }

  renderActivityDetails(){
    let ret = [];
    let holiday = this.state.itemDetailIntro.restdateleports == null ?
      null :
      (<ListItem key="li-holiday">
        <b>{this.state.strings.holiday + " : " }</b>
        <p dangerouslySetInnerHTML = 
          {this.createMarkup(this.state.itemDetailIntro.restdateleports._text)}></p>
      </ListItem>);
    ret.push(holiday);
    let usingTime = this.state.itemDetailIntro.usetimeleports == null ?
      null :
        this.state.itemDetailIntro.usetimeleports._text == null ?
          null :
          (<ListItem key="li-usingTime">
            <b>{this.state.strings.usingtime + " : " }</b>
            <p dangerouslySetInnerHTML = 
              {this.createMarkup(this.state.itemDetailIntro.usetimeleports._text)}>
            </p>
          </ListItem>);
    ret.push(usingTime);
    let reservation = this.state.itemDetailIntro.reservation == null ?
      null :
      this.state.itemDetailIntro.reservation._text == null ?
        null :
        (<ListItem key="li-reservation">
          <b>{this.state.strings.reservation + " : " }</b>
          <p dangerouslySetInnerHTML =
            {this.createMarkup(this.state.itemDetailIntro.reservation._text)}></p>
        </ListItem>);
    ret.push(reservation);
    let playAgeLimit = this.state.itemDetailIntro.expagerangeleports == null ?
      null :
      this.state.itemDetailIntro.usetimeleports._text == null ?
        null :
        (<ListItem key="li-playagelimit">
          <b>{this.state.strings.playagelimit + " : " }</b>
          <p dangerouslySetInnerHTML =
          {this.createMarkup(this.state.itemDetailIntro.expagerangeleports._text)}></p>
        </ListItem>);
    ret.push(playAgeLimit);

    const Styles = DetailViewStyle.list;
    let iconSize = Styles.icons.style;
    let creditcard = this.state.itemDetailIntro.chkcreditcardleports == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcardleports._text;
    let creditCardIcon = creditcard != null && creditcard.includes("가능") ?
      (<img src={Styles.icons.nosmoking} style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parkingleports == null ? 
      null : 
      this.state.itemDetailIntro.parkingleports._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || 
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src={Styles.icons.parking} style={iconSize} />) : null;
    let stroller = this.state.itemDetailIntro.chkbabycarriageleports == null ? 
      null : 
      this.state.itemDetailIntro.chkbabycarriageleports._text;
    let strollerIcon = stroller != null && (stroller.includes("있음") || stroller.includes("Avail")) ? 
      (<img src={Styles.icons.stroller} style={iconSize}/>) : null;
    let pet = this.state.itemDetailIntro.chkpetleports == null ? 
      null : 
      this.state.itemDetailIntro.chkpetleports._text;
    let petIcon = (pet != null && pet.length > 0) && 
      (pet.includes("없음") || pet.includes("No") || pet.includes("N/A")) ? 
      (<img src={Styles.icons.nopet} style={iconSize}/>) : null;

    let etc = (
      <ListItem key="li-icons">
        {creditCardIcon}
        {parkingIcon}
        {strollerIcon}
        {petIcon}
      </ListItem>
    );
    ret.push(etc);
    return ret;
  }

  renderShoppingDetails(){
    let ret = [];

    let saleItem = this.state.itemDetailIntro.saleitem == null ? 
      null : 
      this.state.itemDetailIntro.saleitem._text == null ?
        null :
        (<ListItem key="li-saleItem">
          <b>{this.state.strings.saleitem + " : "}</b>
          <p>{this.state.itemDetailIntro.saleitem._text}</p>
        </ListItem>);
    ret.push(saleItem);
    let workingtime = this.state.itemDetailIntro.opendateshopping == null ? 
      null : 
      this.state.itemDetailIntro.opendateshopping._text == null ?
        null :
        (<ListItem key="li-workingtime">
          <b>{this.state.strings.workingtime + " : "}</b>
          <p>{this.state.itemDetailIntro.opendateshopping._text}</p>
        </ListItem>);
    ret.push(workingtime);
    let restDateShopping = this.state.itemDetailIntro.restdateshopping == null ? 
      null : 
      this.state.itemDetailIntro.restdateshopping._text == null ?
        null :
        (<ListItem key="li-restDateShopping">
          <b>{this.state.strings.restdateshopping + " : "}</b>
          <p>{this.state.itemDetailIntro.restdateshopping._text}</p>
        </ListItem>);
    ret.push(restDateShopping);
    let scale = this.state.itemDetailIntro.scaleshopping == null ? 
      null : 
      this.state.itemDetailIntro.scaleshopping._text == null ?
        null :
        (<ListItem key="li-scale">
          <b>{this.state.strings.scale + " : "}</b>
          <p dangerouslySetInnerHTML = 
            {this.createMarkup(this.state.itemDetailIntro.scaleshopping._text)}></p>
        </ListItem>);
    ret.push(scale);
    let shopGuide = this.state.itemDetailIntro.shopguide == null ? 
      null :
      this.state.itemDetailIntro.shopguide._text == null ?
        null :
        (<ListItem key="li-shopGuide">
          <b>{this.state.strings.shopguide + " : "}</b>
          <p>{this.state.itemDetailIntro.shopguide._text}</p>
        </ListItem>);
    ret.push(shopGuide);

    const Styles = DetailViewStyle.list;
    let iconSize = Styles.icons.style;
    let creditcard = this.state.itemDetailIntro.chkcreditcardshopping == null ? 
      null : this.state.itemDetailIntro.chkcreditcardshopping._text;
    let creditCardIcon = creditcard != null && creditcard.includes("가능") ?
      (<img src={Styles.icons.creditcard} style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parkingshopping == null ? 
      null : this.state.itemDetailIntro.parkingshopping._text;
    let parkingIcon = 
      parking != null && (parking.includes("가능") || parking.includes("주차") || 
        parking.includes("Available") || parking.includes("spaces")) ?
          (<img src={Styles.icons.parking} style={iconSize} />) : null;
    let stroller = this.state.itemDetailIntro.chkbabycarriageshopping == null ? 
      null : this.state.itemDetailIntro.chkbabycarriageshopping._text;
    let strollerIcon = 
      stroller != null && (stroller.includes("있음") || stroller.includes("Avail")) ? 
        (<img src={Styles.icons.stroller} style={iconSize}/>) : null;
    let pet = this.state.itemDetailIntro.chkpetshopping == null ? 
      null : this.state.itemDetailIntro.chkpetshopping._text;
    let petIcon = 
      (pet != null && pet.length > 0) && (pet.includes("없음") || pet.includes("No") || pet.includes("N/A")) ? 
        (<img src={Styles.icons.nopet} style={iconSize}/>) : null;
    let restroom = this.state.itemDetailIntro.restroom  == null ? 
      null : this.state.itemDetailIntro.restroom._text;
    let restroomIcon = 
      (restroom != null && restroom.length > 0) && (restroom.includes("있음") || restroom.includes("Avail")) ? 
        (<img src={Styles.icons.restroom} style={iconSize}/>) : null;
    let etc = (
      <ListItem key="li-icons">
        {creditCardIcon}
        {parkingIcon}
        {strollerIcon}
        {petIcon}
        {restroomIcon}
      </ListItem>
    );
    ret.push(etc);
    return ret;
  }

  renderSightDetails() {
    let ret = [];
    let infocenter = this.state.itemDetailIntro.infocenter == null ? 
      null :
      this.state.itemDetailIntro.infocenter._text == null ?
        null :
        (<ListItem key="li-infocenter">
          <b>{this.state.strings.infocenter + " : " }</b>
          <p dangerouslySetInnerHTML=
            {this.createMarkup(this.state.itemDetailIntro.infocenter._text)}></p>
        </ListItem>);
    ret.push(infocenter);
    let parser = new DOMParser();
    let expguide = this.state.itemDetailIntro.expguide == null ? 
      null :
      this.state.itemDetailIntro.expguide._text == null ?
        null :
        (<ListItem key="li-expguide">
          <b>{this.state.strings.expguide + " : "}</b>
          <p dangerouslySetInnerHTML =
            {this.createMarkup(this.state.itemDetailIntro.expguide._text)}></p>
        </ListItem>);
    ret.push(expguide);
    let expagerange = this.state.itemDetailIntro.expagerange == null ? 
      null : 
      this.state.itemDetailIntro.expagerange._text == null ?
        null :
        (<ListItem key="li-expagerange">
          <b>{this.state.strings.expagerange + " : "}</b>
          <p dangerouslySetInnerHTML = 
            {this.createMarkup(this.state.itemDetailIntro.expagerange._text)}></p>
        </ListItem>);
    ret.push(expagerange);
    let holiday = this.state.itemDetailIntro.restdate == null ? 
      null : 
      this.state.itemDetailIntro.restdate._text == null ?
        null :
        (<ListItem key="li-holiday">
          <b>{this.state.strings.holiday + " : "}</b>
          <p dangerouslySetInnerHTML = 
            {this.createMarkup(this.state.itemDetailIntro.restdate._text)}></p>
        </ListItem>);
    ret.push(holiday);
    let usetime = this.state.itemDetailIntro.usetime == null ? 
      null :
      this.state.itemDetailIntro.usetime._text == null ?
        null :
        (<ListItem key="li-usetime">
          <b>{this.state.strings.workingtime + " : "}</b>
          <p dangerouslySetInnerHTML = 
            {this.createMarkup(this.state.itemDetailIntro.usetime._text)}></p>
        </ListItem>);
    ret.push(usetime);

    const Styles = DetailViewStyle.list;

    let iconSize = Styles.icons.style;
    let stroller = this.state.itemDetailIntro.chkbabycarriage == null ? 
      null : 
      this.state.itemDetailIntro.chkbabycarriage._text;
    let strollerIcon = stroller != null && (stroller.includes("있음") || stroller.includes("Avail")) ? 
      (<img src={Styles.icons.stroller} style={iconSize}/>) : null;
    let pet = this.state.itemDetailIntro.chkpet == null ? 
      null : 
      this.state.itemDetailIntro.chkpet._text;
    let petIcon = (pet != null && pet.length > 0) && 
      (pet.includes("없음") || pet.includes("No") || pet.includes("N/A")) ? 
      (<img src={Styles.icons.nopet} style={iconSize}/>) : null;
    let creditcard = this.state.itemDetailIntro.chkcreditcard == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcard._text;
    let creditCardIcon = creditcard != null && 
      (creditcard.includes("가능") || creditcard.includes("있음") || 
       creditcard.includes("Available")) ?
      (<img src={Styles.icons.creditcard} style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parking == null ? 
      null : 
      this.state.itemDetailIntro.parking._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || parking.includes("있음") ||
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src={Styles.icons.parking} style={iconSize} />) : null;

    let reservation = this.state.itemDetailIntro.reservationfood == null ? 
      null : 
      this.state.itemDetailIntro.reservationfood._text;

    let etc = (
      <ListItem key="li-icons">
        {strollerIcon}
        {petIcon}
        {creditCardIcon}
        {parkingIcon}
      </ListItem>
    );
    ret.push(etc);

    return ret;
    
  }

  renderDetail() {
    if(this.state.itemDetailIntro != null && this.state.itemDetailCommon != null) {
      let detailList = [];

      let address = this.state.itemDetailCommon.addr1 == null ? 
        null : 
        (<ListItem key="li-address"> 
          <b>{this.state.strings.address + " : "}</b><p>{this.state.itemDetailCommon.addr1._text}</p> 
        </ListItem>);
      detailList.push(address);
      let telephone = this.state.itemDetailCommon.tel == null ? 
        null : 
        (<ListItem key="li-phonenum"> 
          <b>{this.state.strings.phonenum + " : "}</b><p>{this.state.itemDetailCommon.tel._text}</p>
        </ListItem>);
      detailList.push(telephone);

      let contentTypeId = this.state.itemDetailCommon.contenttypeid._text;
      let ret;
      if(contentTypeId == 12 || contentTypeId == 76) {
        // sight
        ret = this.renderSightDetails();
      }
      else if(contentTypeId == 24 || contentTypeId == 78 || contentTypeId == 14) {
        // culture
        ret = this.renderCultureDetails();
      }
      else if(contentTypeId == 15 || contentTypeId == 85) {
        // festival
        ret = this.renderFestivalDetails();
      }
      else if(contentTypeId == 28 || contentTypeId == 75) {
        // activity
        ret = this.renderActivityDetails();
      }
      else if(contentTypeId == 38 || contentTypeId == 79) {
        // shopping
        ret = this.renderShoppingDetails();
      }
      else if(contentTypeId == 39 || contentTypeId == 82) {
        // foods
        ret = this.renderRestaurantDetails();
      }
      detailList = detailList.concat(ret);

      return (
        <List>
          {detailList}
        </List>
      );
    }
    else return null;
  } 

  render() {
    let {commonField, listField, map} = this.renderCommon();
    if(!commonField) {
      commonField = (
        <Card>
          <div className = "title center">
            <ProgressCircular indeterminate />
          </div>
          <div className = "content">
            <b>Please wait...</b>
          </div>
        </Card>);
    }

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
       renderModal={() => (
          <Modal
            isOpen={this.state.isOpen}>
            <div style={DetailViewStyle.modal.style}>
              <img src={this.state.imageForModal} style={DetailViewStyle.modal.img.style} />
              <Button modifier='quiet' onClick={() => this.setState({isOpen: false})}
                style={DetailViewStyle.modal.close.style} >
                <Icon icon={DetailViewStyle.modal.close.icon} 
                  size={DetailViewStyle.modal.close.size} />
              </Button>
            </div>
          </Modal>
        )}>
        <div>
	  <div style={DetailViewStyle.title.style}><h4><b>{this.state.strings.overview}</b></h4></div>
          {commonField}
          <div style={DetailViewStyle.title.style}><h4><b>{this.state.strings.godetails}</b></h4></div>
          {map}
          {listField}
        </div>
      </Page>
    );
  }
}
