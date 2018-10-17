import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem} from 'react-onsenui';

import MapView from './MapView';
import PixabayImage from './PixabayImage';
import WeatherPage from './WeatherPage';

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
    let cache = JSON.parse(localStorage.getItem("weather"));
    let useCache = false;
    if(cache != null) {
      let cacheValidUntil = new Date(cache.createdDateTime);
      cacheValidUntil.setHours(cacheValidUntil.getHours() + 1);
      // cache will be valid until + 1 hour of the created hour.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
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
        let weather = cache.data;
        this_.setState({
          weatherIcon: weather.weatherIcon,
          weatherDegree: weather.weatherDegree,
        });
      });

      return; 
    }

    var this_ = this;
    let lang = this.props.strings.getLanguage();
    let URL = "https://api.openweathermap.org/data/2.5/weather?q=Jeju,kr" + 
      "&appid=8e0c89b8e26008044c73cb82ed5e4d60" + 
      "&lang=" + lang;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        console.log(res);
        let weatherIcon = "img/weather/" + res.weather[0].icon + ".png";
        let weatherDegree = res.main.temp - 273.15;
        let tempMin = res.main.temp_min - 273.15;
        let tempMax = res.main.temp_max - 273.15;
        this_.setState({
          weatherIcon: weatherIcon,
          weatherDegree: weatherDegree,
          tempMin: tempMin,
          tempMax: tempMax
        });
        localStorage.setItem("weather", JSON.stringify({
          createdDateTime: new Date(),
          data: {
            weatherIcon: weatherIcon,
            weatherDegree: weatherDegree,
            tempMin: tempMin,
            tempMax: tempMax
          }
        }));
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

  pushWeatherPage() {
    this.props.navigator.pushPage({ 
      component: WeatherPage 
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
	  <Button modifier="quiet"
            style={{position: "absolute", top: "10px", textAlign: "center", borderRadius: "6px", 
              right: "10px", backgroundColor: "rgba(255, 250, 250, .4)"}} 
            onClick={this.pushWeatherPage.bind(this)}>
            <img src={this.state.weatherIcon} style={{width: "40px", float: "left"}} />
            <span style={{float: "left", marginTop: "10%", color: "#000000"}}>
              {this.state.weatherDegree + "ºC"}
            </span>
          </Button>
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
                onClick={this.pushPage.bind(this, foodsCode)}>
                <div className = "left">
                  <img src = "img/food.png" style = {{height: "60px"}} />
                </div>
                <div className = "center">
                  <h3>{this.props.strings.foods}</h3>
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
            </List>
          </div>
        </div>
      </Page>
    );
  }
}
