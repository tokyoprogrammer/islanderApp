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
      itemDetailIntro: null,
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
        reject(new TypeError('Local request failed'));
      }
      xhr.open('GET', this_.state.urlForContentDetailCommon);
      xhr.send(null);
    });
  }
  readDetailIntro(){
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
        reject(new TypeError('Local request failed'));
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

  markerClicked(e, id) {
  }

  renderCommon() {
    if(this.state.itemDetailCommon != null) {
      let title = this.state.itemDetailCommon.title == null ? 
        "" : this.state.itemDetailCommon.title._text;
      let overview = this.state.itemDetailCommon.overview == null ? 
        "" : this.state.itemDetailCommon.overview._text.replace(/<br\s*[\/]?>/gi, "\n");

      let imageSrc = this.state.itemDetailCommon.firstimage == null ? 
        (<GooglePlaceImageView maxWidth = {400} maxHeight = {400} 
           placeTitle = {this.state.itemDetailCommon.title._text} listThumbnail={false} />) : 
        (<img src={this.state.itemDetailCommon.firstimage._text} style={{width: "100%"}} />);

      let commonField = (
        <div>
          <Card>
            <div>{imageSrc}</div>
            <div className="title left">{title}</div>
            <div className="content">
              <div><p>{overview}</p></div>
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

  renderDetail() {
    if(this.state.itemDetailIntro != null && this.state.itemDetailCommon != null) {
      let address = this.state.itemDetailCommon.addr1 == null ? 
        null : 
        (<ListItem> 
          <b>{this.state.strings.address + " : "}</b><p>{this.state.itemDetailCommon.addr1._text}</p> 
        </ListItem>);
      let telephone = this.state.itemDetailCommon.tel == null ? 
        null : 
        (<ListItem> 
          <b>{this.state.strings.phonenum + " : "}</b><p>{this.state.itemDetailCommon.tel._text}</p>
        </ListItem>);
      let worktime = this.state.itemDetailIntro.opentimefood == null ? 
        null : 
        (<ListItem>
          <b>{this.state.strings.workingtime + " : " }</b><p>{this.state.itemDetailIntro.opentimefood._text}</p>
        </ListItem>);
      let holiday = this.state.itemDetailIntro.restdatefood == null ? 
        null : 
        (<ListItem>
          <b>{this.state.strings.holiday + " : "}</b><p>{this.state.itemDetailIntro.restdatefood._text}</p>
        </ListItem>);
      let firstmenu = this.state.itemDetailIntro.firstmenu == null ? 
        null : 
        (<ListItem>
          <b>{this.state.strings.firstmenu + " : "}</b>
          <p>
            {this.state.itemDetailIntro.firstmenu._text.replace(/<br\s*[\/]?>/gi, "\n")}
          </p>
        </ListItem>);
      let treatmenu = this.state.itemDetailIntro.treatmenu == null ? 
        null : 
        (<ListItem>
          <b>{this.state.strings.treatmenu + " : "}</b>
          <p>
            {this.state.itemDetailIntro.treatmenu._text.replace(/<br\s*[\/]?>/gi, "\n")}
          </p>
        </ListItem>);
      
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
        <ListItem>
          {smokingIcon}
          {creditCardIcon}
          {parkingIcon}
        </ListItem>
      );

      return (
        <List>
          {telephone}
          {address}
          {worktime}
          {holiday}
          {firstmenu}
          {treatmenu}
          {etc}
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
