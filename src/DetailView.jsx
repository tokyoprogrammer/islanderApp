import React from 'react';
import ReactDOM from 'react-dom';

import LocalizedStrings from 'react-localization';

import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, ProgressCircular, ListItem, List, Card} from 'react-onsenui';

import GooglePlaceImageView from './GooglePlaceImageView';

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
 
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);

    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
 
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
      strings: strings,
      itemDetailCommon: null,
      itemDetailIntro: null
    };
    
    strings.setLanguage(lang);
    this.readDetailCommon();
    this.readDetailIntro();
  }

  readDetailCommon() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        console.log(xml);
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
        console.log(xml);
        this_.setState({itemDetailIntro: xml.response.body.items.item});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Load Detail Intro failed'));
      }
      xhr.open('GET', this_.state.urlForContentDetailIntro);
      xhr.send(null);
    });
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

  createMarkup(text) {
    return {__html: text }; 
  }

  renderCommon() {
    if(this.state.itemDetailCommon != null) {
      let title = this.state.itemDetailCommon.title == null ? 
        "" : this.state.itemDetailCommon.title._text;
      let overview = this.state.itemDetailCommon.overview == null ? 
        "" : this.state.itemDetailCommon.overview._text;

      let imageSrc = this.state.itemDetailCommon.firstimage == null ? 
        (<GooglePlaceImageView maxWidth = {400} maxHeight = {400} 
           placeTitle = {this.state.itemDetailCommon.title._text} listThumbnail={false} multi={true}/>) : 
        (<img src={this.state.itemDetailCommon.firstimage._text} style={{width: "100%"}} />);

      let commonField = (
        <div>
          <Card>
            <div>{imageSrc}</div>
            <div className="title left">{title}</div>
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
        const zoom = 16;
        const mapSize = "600x250";

        const google = "AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ";
        let mapURL = "https://maps.googleapis.com/maps/api/staticmap?" + 
          "center=" + lat + "," + lng + "&zoom=" + zoom + 
          "&size=" + mapSize + "&maptype=roadmap&markers=color:red%7C" + 
          lat + "," + lng + "&key=" + google;
        map = (<img src = {mapURL} style={{width: '100%'}} />);
      }
 
      return {commonField: commonField, listField: listField, map: map};
    }
    else return {commonField: null, listField: null, map: null};
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
        <b>{this.state.strings.holiday + " : "}</b><p>{this.state.itemDetailIntro.restdatefood._text}</p>
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

    let iconSize={width: "50px", height : "50px", margin: '1%'};
    let smoking = this.state.itemDetailIntro.smoking == null ? 
      null : 
      this.state.itemDetailIntro.smoking._text;
    let smokingIcon = smoking != null && (smoking.includes("Non") || smoking.includes("금연")) ? 
      (<img src="img/smoking-ban.png" style={iconSize}/>) : null;
    let creditcard = this.state.itemDetailIntro.chkcreditcardfood == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcardfood._text;
    let creditCardIcon = creditcard != null && creditcard.includes("가능") ?
      (<img src="img/card.png" style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parkingfood == null ? 
      null : 
      this.state.itemDetailIntro.parkingfood._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || 
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src="img/parking.png" style={iconSize} />) : null;

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


  renderSightDetails() {
    let ret = [];
    let infocenter = this.state.itemDetailIntro.infocenter == null ? 
      null : 
      (<ListItem key="li-infocenter">
        <b>{this.state.strings.infocenter + " : " }</b>
        <p dangerouslySetInnerHTML={this.createMarkup(this.state.itemDetailIntro.infocenter._text)}></p>
      </ListItem>);
    ret.push(infocenter);
    let parser = new DOMParser();
    let expguide = this.state.itemDetailIntro.expguide == null ? 
      null : 
      (<ListItem key="li-expguide">
        <b>{this.state.strings.expguide + " : "}</b>
        <p dangerouslySetInnerHTML = {this.createMarkup(this.state.itemDetailIntro.expguide._text)}></p>
      </ListItem>);
    ret.push(expguide);
    let expagerange = this.state.itemDetailIntro.expagerange == null ? 
      null : 
      (<ListItem key="li-expagerange">
        <b>{this.state.strings.expagerange + " : "}</b>
        <p>
          {this.state.itemDetailIntro.expagerange._text}
        </p>
      </ListItem>);
    ret.push(expagerange);
    let holiday = this.state.itemDetailIntro.restdate == null ? 
      null : 
      (<ListItem key="li-holiday">
        <b>{this.state.strings.holiday + " : "}</b>
        <p>
          {this.state.itemDetailIntro.restdate._text}
        </p>
      </ListItem>);
    ret.push(holiday);
    let usetime = this.state.itemDetailIntro.usetime == null ? 
      null : 
      (<ListItem key="li-usetime">
        <b>{this.state.strings.workingtime + " : "}</b>
        <p dangerouslySetInnerHTML = {this.createMarkup(this.state.itemDetailIntro.usetime._text)}>
        </p>
      </ListItem>);
    ret.push(usetime);

    let iconSize={width: "50px", height : "50px", margin: '1%'};
    let stroller = this.state.itemDetailIntro.chkbabycarriage == null ? 
      null : 
      this.state.itemDetailIntro.chkbabycarriage._text;
    let strollerIcon = stroller != null && (stroller.includes("있음") || stroller.includes("Avail")) ? 
      (<img src="img/stroller.png" style={iconSize}/>) : null;
    let pet = this.state.itemDetailIntro.chkpet == null ? 
      null : 
      this.state.itemDetailIntro.chkpet._text;
    let petIcon = (pet != null && pet.length > 0) && 
      (pet.includes("없음") || pet.includes("No") || pet.includes("N/A")) ? 
      (<img src="img/nopet.png" style={iconSize}/>) : null;
    let creditcard = this.state.itemDetailIntro.chkcreditcard == null ? 
      null : 
      this.state.itemDetailIntro.chkcreditcard._text;
    let creditCardIcon = creditcard != null && 
      (creditcard.includes("가능") || creditcard.includes("있음") || 
       creditcard.includes("Available")) ?
      (<img src="img/card.png" style={iconSize} />) : null;
    let parking = this.state.itemDetailIntro.parking == null ? 
      null : 
      this.state.itemDetailIntro.parking._text;
    let parkingIcon = parking != null && 
      (parking.includes("가능") || parking.includes("주차") || parking.includes("있음") ||
       parking.includes("Available") || parking.includes("spaces")) ?
      (<img src="img/parking.png" style={iconSize} />) : null;

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
      else if(contentTypeId == 24 || contentTypeId == 78) {
        // culture
      }
      else if(contentTypeId == 15 || contentTypeId == 85) {
        // festival
      }
      else if(contentTypeId == 28 || contentTypeId == 75) {
        // activity
      }
      else if(contentTypeId == 38 || contentTypeId == 79) {
        // shopping
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
    const centerDiv = {
      textAlign: 'center'
    };

    let textStyle = {
      margin: '5px',
    };
    
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
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div>
          <div style={{margin: '1%'}}><h4><b>{this.state.strings.overview}</b></h4></div>
          {commonField}
          <div style={{margin: '1%'}}><h4><b>{this.state.strings.godetails}</b></h4></div>
          {map}
          {listField}
        </div>
      </Page>
    );
  }
}
