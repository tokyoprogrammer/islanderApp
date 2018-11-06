import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem, Row, Col} from 'react-onsenui';

import MapView from './MapView';
import PixabayImage from './PixabayImage';
import WeatherPage from './WeatherPage';
import HomePlanCard from './HomePlanCard'; 

import {DivH100Style, ToolbarStyle, HomeStyle} from './Styles';

import './HomePageCSS';

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
      "&appid=" + process.env.REACT_APP_WEATHER_API_KEY + 
      "&lang=" + lang;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        let weatherIcon = "img/weather/" + res.weather[0].icon + ".png";
        let weatherDegree = (res.main.temp - 273.15).toFixed(1);
        let tempMin = (res.main.temp_min - 273.15).toFixed(1);
        let tempMax = (res.main.temp_max - 273.15).toFixed(1);
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
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'>
        <img src={ToolbarStyle.btns.lang.imgs.eng} 
          style={ToolbarStyle.btns.lang.imgs.style}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'>
        <img src={ToolbarStyle.btns.lang.imgs.kor}
          style={ToolbarStyle.btns.lang.imgs.style}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
        <div className="center">
          <img src={ToolbarStyle.title.imgs.logo.url} style={ToolbarStyle.title.imgs.logo.style} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon size={ToolbarStyle.menu.size} icon={ToolbarStyle.menu.icon} />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  render() {
    const isKr = this.props.strings.getLanguage() == 'kr' ? true : false;
    
    let sightCode = isKr ? 12 : 76; 
    let cultureCode = isKr ? 14 : 78;
    let festivalCode = isKr ? 15 : 85;
    let activityCode = isKr ? 28 : 75;
    let shoppingCode = isKr ? 38 : 79;
    let foodsCode = isKr ? 39 : 82;

    const weatherStyles = HomeStyle.weather;
    const mainBtns = HomeStyle.mainbtns;
    const plans = HomeStyle.plan;

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={DivH100Style}>
          <PixabayImage />
	  <Button modifier="quiet"
            style={weatherStyles.container.style} 
            onClick={this.pushWeatherPage.bind(this)}>
            <img src={this.state.weatherIcon} style={weatherStyles.icon.style} />
            <span style={weatherStyles.text.style}>
              {this.state.weatherDegree + weatherStyles.text.degree}
            </span>
          </Button>
          <div style={mainBtns.container.style}>
            <Row style={mainBtns.rows.first.style}>
              <Col width={mainBtns.cols.col1.width}>
                <div style={mainBtns.cols.col1.div.style}>
                  <Button style={mainBtns.cols.col1.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, sightCode)}>
                    <img src={mainBtns.icons.sightseeing} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.sight}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col2.width}>
                <div style={mainBtns.cols.col2.div.style}>
                  <Button style={mainBtns.cols.col2.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, foodsCode)}>
                    <img src={mainBtns.icons.food} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.foods}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col3.width}>
                <div style={mainBtns.cols.col3.div.style}>
                  <Button style={mainBtns.cols.col3.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, cultureCode)}>
                    <img src={mainBtns.icons.culture} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.art}</strong></p>
                </div>
              </Col>
            </Row>
            <Row style={mainBtns.rows.second.style}>
              <Col width={mainBtns.cols.col1.width}>
                <div style={mainBtns.cols.col1.div.style}>
                  <Button style={mainBtns.cols.col1.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, festivalCode)}>
                    <img src={mainBtns.icons.festival} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.festival}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col2.width}>
                <div style={mainBtns.cols.col2.div.style}>
                  <Button style={mainBtns.cols.col2.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, activityCode)}>
                    <img src={mainBtns.icons.activity} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.activity}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col3.width}>
                <div style={mainBtns.cols.col3.div.style}>
                  <Button style={mainBtns.cols.col3.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, shoppingCode)}>
                    <img src={mainBtns.icons.shopping} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.shopping}</strong></p>
                </div>
              </Col>
            </Row>
          </div>
          <div className="scrolling-wrapper" style={plans.container.style}>
            <HomePlanCard />
            <HomePlanCard />
            <HomePlanCard />            
          </div>
        </div>
      </Page>
    );
  }
}
