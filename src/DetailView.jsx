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
      urlForContentBase: "https://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/detailCommon?ServiceKey=" + 
        serviceKey + "&contentTypeId=" + contentTypeId + "&contentId=" + contentId + 
        "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y" + 
        "&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&" +
        "overviewYN=Y&transGuideYN=Y",
      strings: strings,
      item: {}
    };
    
    strings.setLanguage(lang);
    this.readDetails();
  }

  readDetails() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var convert = require('xml-js');
        var options = {compact: true, ignoreComment: true, spaces: 4};
        var xml = convert.xml2js(xhr.responseText, options);
        console.log(xml);
        this_.setState({item: xml.response.body.items.item});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Local request failed'));
      }
      xhr.open('GET', this_.state.urlForContentBase);
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
    let imageSrc = this.state.item.firstimage == null ? 
      (<img src="img/noimage.png" style={{width: "100%"}}/>) : 
      (<img src={this.state.item.firstimage._text} style={{width: "100%"}} />);

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={{marginTop: '1%', marginBottom: '1%'}}>
          {imageSrc}
        </div>
      </Page>
    );
  }
}
