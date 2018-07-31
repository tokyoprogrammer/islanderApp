import React from 'react';
import ReactDOM from 'react-dom';

import LocalizedStrings from 'react-localization';

import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular} from 'react-onsenui';

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
      urlForContentDetailIntro: "http://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/detailIntro?ServiceKey=" +
        serviceKey + "&contentTypeId=" + contentTypeId + "&contentId=" + contentId +
        "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&introYN=Y",


      strings: strings,
      itemDetailCommon: {},
      itemDetailIntro: {},
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

  

  render() {
    const centerDiv = {
      textAlign: 'center'
    };

  let textStyle = {
    margin: '5px',
  };

    let imageSrc = this.state.itemDetailCommon.firstimage == null ? 
      (<img src="img/noimage.png" style={{width: "100%"}}/>) : 
      (<img src={this.state.itemDetailCommon.firstimage._text} style={{width: "100%"}} />);

    let title = this.state.itemDetailCommon.title == null ? "" : this.state.itemDetailCommon.title._text;
    let overview = this.state.itemDetailCommon.overview == null ? "" : this.state.itemDetailCommon.overview._text;
    let address = this.state.itemDetailCommon.addr1 == null ? "" : this.state.itemDetailCommon.addr1._text;
    let telephone = this.state.itemDetailCommon.tel == null ? "" : this.state.itemDetailCommon.tel._text;

    let worktime = this.state.itemDetailIntro.opentimefood ==null ? "" : this.state.itemDetailIntro.opentimefood._text;
    let holiday	= this.state.itemDetailIntro.restdatefood ==null ? "" : this.state.itemDetailIntro.restdatefood._text;
    let firstmenu = this.state.itemDetailIntro.firstmenu ==null ? "" : this.state.itemDetailIntro.firstmenu._text;
    let treatmenu = this.state.itemDetailIntro.treatmenu ==null ? "" : this.state.itemDetailIntro.treatmenu._text;
    let smoking = this.state.itemDetailIntro.smoking ==null ? "" : this.state.itemDetailIntro.smoking._text;
    let parking = this.state.itemDetailIntro.parkingfood ==null ? "" : this.state.itemDetailIntro.parkingfood._text;
    let creditcard = this.state.itemDetailIntro.chkcreditcardfood ==null ? "" : this.state.itemDetailIntro.chkcreditcardfood._text;
    let reservation = this.state.itemDetailIntro.reservationfood ==null ? "" : this.state.itemDetailIntro.reservationfood._text;
    
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={{marginTop: '1%', marginBottom: '1%'}}>
          {imageSrc}
        </div>
        <ons-list>
          <ons-list-header>
            <div style={{marginLeft:'10px', marginRight:'10px', marginTop:'10px',marginBottom:'10px'}}><h1>{title}</h1></div>
          </ons-list-header>
          <ons-list-item>
            <div style={{fontSize:'4px', margin: '5px'}}>{overview}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>{address}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>연락처 {telephone}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>영업시간 {worktime}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>쉬는날  {holiday}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>대표메뉴  {firstmenu}</div>
          </ons-list-item>
	    <div style={textStyle}>취급메뉴  {treatmenu}</div>
          <ons-list-item>
            <div style={textStyle}>예약안내  {reservation}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>신용카드  {creditcard}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>주차시설  {parking}</div>
          </ons-list-item>
          <ons-list-item>
            <div style={textStyle}>금연/흡연  {smoking}</div>
          </ons-list-item>









        </ons-list>
     </Page>
    );
  }
}
