import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button} from 'react-onsenui';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    this.state = {
      selectedAreaCode: 0,
      urlForAreaCode: "http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaCode?serviceKey=" + 
        serviceKey + 
        "&numOfRows=10&pageSize=10&pageNo=1&startPage=1&MobileOS=ETC&MobileApp=IslanderJeju&areaCode=" + 
        fixedAreaCode,
      areaLists: []
    };

    this.readSubArea();
  }

  readSubArea() {
    var this_ = this;
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
      xhr.open('GET', this_.state.urlForAreaCode);
      xhr.send(null);
    });
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    let imgStyle= {
      height: '35%',
      marginTop: '5%'
    };
    return (
      <Toolbar>
        <div className="center">
        Islander Jeju <img src="img/milgam.png" style={imgStyle} />
        </div>
        <div className='left'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon icon='ion-navicon, material:md-menu' />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  render() {
    let buttonStyle = {
      margin: '3%',
      width: '40%'
    };
    let imageStyle = {
      width: '100%'
    };
    let divCenter = {
      textAlign: 'center'
    };
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/sightseeing.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>관광지</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/culture.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>문화, 예술, 역사</p>
            </div>
          </Button>
        </div>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/festival.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>축제, 공연</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/activity.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>액티비티</p>
            </div>
          </Button>
        </div>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/shopping.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>쇼핑</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet'>
            <img src="img/food.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>먹거리</p>
            </div>
          </Button>
        </div>
      </Page>
    );
  }
}
