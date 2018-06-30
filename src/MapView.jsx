import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput} from 'react-onsenui';

import MapContainer from './MapContainer'

export default class MapView extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);

    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    this.state = {
      urlForContentBase: "http://api.visitkorea.or.kr/openapi/service/rest/" + 
        "KorService/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=", 
      urlForContentRemain: "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC" + 
        "&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=1000&pageNo=1",
      segmentIndex: 0
    };
    
    this.readLists(this.props.code);
  }

  showMenu() {
    this.props.showMenu();
  }

  readLists(code) {
    var this_ = this;
    console.log(this.state.urlForContentBase + code + this.state.urlForContentRemain);
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var XMLParser = require('react-xml-parser');
        var xml = new XMLParser().parseFromString(xhr.responseText);
        console.log(xml);
        console.log(xml.getElementsByTagName('item'));

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForContentBase + code + this_.state.urlForContentRemain);
      xhr.send(null);
    });
  }

  renderToolbar() {
    const imgStyle= {
      height: '35%',
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

    const innerDiv = {
      margin: '1%'
    };

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={centerDiv}>
          <div style={innerDiv}>
            <Segment index={this.state.segmentIndex} 
              onPostChange={() => this.setState({ segmentIndex: event.index})} style={{ width: '55%' }}>
              <Button>{this.props.strings.all}</Button>
              <Button>{this.props.strings.seoguipo}</Button>
              <Button>{this.props.strings.jeju}</Button>
            </Segment>
          </div>
          <div style={innerDiv}>
            <SearchInput placeholder='Search...' onChange={(e) => console.log(e.target.value)} />
          </div>
          <div style={{marginTop: '1%', marginBottom: '1%'}}>
            <MapContainer google={this.props.google} />
          </div>
        </div>
      </Page>
    );
  }
}
