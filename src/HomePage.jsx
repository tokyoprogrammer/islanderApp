import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem} from 'react-onsenui';

import MapView from './MapView';
import PixabayImage from './PixabayImage';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      weatherIcon: "",
      weatherDegree: ""
    }
    this.readWeather();
  }

  readWeather() {
    var this_ = this;
    let URL = "http://api.openweathermap.org/data/2.5/weather?q=Jeju,kr&appid=8e0c89b8e26008044c73cb82ed5e4d60";
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        this_.setState({
          weatherIcon: "http://openweathermap.org/img/w/" + res.weather[0].icon + ".png",
          weatherDegree: res.main.temp - 273.15
        });
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', URL);
      xhr.send(null);
    });
  }

  pushPage(code) {
    localStorage.setItem("code", code);
    this.props.navigator.pushPage({ 
      component: MapView 
    });
  }

  showMenu() {
    this.props.showMenu();
  }

  changeLanguage() {
    let lang = this.props.strings.getLanguage();
    if(lang == 'kr') {
      this.props.strings.setLanguage('en');
      localStorage.setItem('lang', 'en');
    } else {
      this.props.strings.setLanguage('kr');
      localStorage.setItem('lang', 'kr');
    }
    this.setState({});
  }

  renderToolbar() {
    const imgStyle = {
      height: '15px',
      marginTop: '5%'
    };
    
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/english.png" 
         style={{width: "33px"}}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/korean.png" 
         style={{width: "33px"}}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
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
    const buttonStyle = {
      margin: '3%',
      width: '40%'
    };

    const imageStyle = {
      width: '100%'
    };

    const divCenter = {
      textAlign: 'center'
    };

    const isKr = this.props.strings.getLanguage() == 'kr' ? true : false;
    
    let sightCode = isKr ? 12 : 76; 
    let cultureCode = isKr ? 14 : 78;
    let festivalCode = isKr ? 15 : 85;
    let activityCode = isKr ? 28 : 75;
    let shoppingCode = isKr ? 38 : 79;
    let foodsCode = isKr ? 39 : 82;
    const minHeightForBG = "200px";
    let listItemStyle = {
      backgroundColor: "rgba(255, 255, 255, 1.0)", 
      marginBottom: "1%",
      boxShadow: "0px 2px 2px 2px #9E9E9E",
    };

    let listDivStyle = {
      margin: "3%",
      marginTop: "-15%",
      boxShadow: "2px 0px 2px 2px #9E9E9E",
    };

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={{height: "100%"}}>
          <PixabayImage />
          <div style={{position: "absolute", top: "10px", textAlign: "center", borderRadius: "6px", 
            right: "10px", backgroundColor: "rgba(255,250,250, .4)"}}>
            <img src={this.state.weatherIcon} style={{width: "40px", float: "left"}} />
            <span style={{float: "left", marginTop: "10%"}}>{this.state.weatherDegree + "ºC"}</span>
          </div>
          <div style={listDivStyle}>
            <List style={{backgroundColor: "rgba(255, 255, 255, 1.0)", boxShadow: "2px 2px 2px 2px #9E9E9E"}}>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, sightCode)}>
                <div className = "left">
                  <img src = "img/sightseeing.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.sight}</h3>
                </div>
              </ListItem>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, cultureCode)}>
                <div className = "left">
                  <img src = "img/culture.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.art}</h3>
                </div>
              </ListItem>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, festivalCode)}>
                <div className = "left">
                  <img src = "img/festival.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.festival}</h3>
                </div>
              </ListItem>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, activityCode)}>
                <div className = "left">
                  <img src = "img/activity.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.activity}</h3>
                </div>
              </ListItem>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, shoppingCode)}>
                <div className = "left">
                  <img src = "img/shopping.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.shopping}</h3>
                </div>
              </ListItem>
              <ListItem style={listItemStyle} tappable={true} modifier="nodivider" 
                onClick={this.pushPage.bind(this, foodsCode)}>
                <div className = "left">
                  <img src = "img/food.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.foods}</h3>
                </div>
              </ListItem>
            </List>
          </div>
        </div>
      </Page>
    );
  }
}
