import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Button, List, ListItem, Row, Col} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import {CenterDivW100Style, CenterDivStyle, WeatherViewStyle} from './Styles';

export default class WeatherView extends React.Component {
  constructor(props) {
    super(props);
    let lang = localStorage.getItem("lang");
 
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let cache = JSON.parse(localStorage.getItem("weather"));

    this.state = {
      cache: cache.data,
      strings: strings,
      forecast: []
    };
    
    this.readForecast()
  }

  readForecast() {
    let cache = JSON.parse(localStorage.getItem("forecast"));
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
        let forecast = cache.data;
        this_.setState({
          forecast: forecast
        });
      });

      return; 
    }

    var this_ = this;
    let URL = "https://api.openweathermap.org/data/2.5/forecast?q=Jeju,kr" + 
      "&appid=" + process.env.REACT_APP_WEATHER_API_KEY;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        this_.setState({
          forecast: res.list
        });
        localStorage.setItem("forecast", JSON.stringify({
          createdDateTime: new Date(),
          data: res.list
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
 
  render24Forecast() {
    let cols = [];
    const centerDiv = CenterDivW100Style;
    if(this.state.forecast.length > 8) {
      for(let i = 0; i < 8; i++) {
        let item = this.state.forecast[i];
        let dt = new Date(item.dt * 1000);
        let hours = dt.getHours();
        let icon = "img/weather/" + item.weather[0].icon + ".png";
        let degree = (item.main.temp - 273.15).toFixed(1);
        let colItem = (
          <Col key={"24-col-" + i}>
            <Row>
              <div style={centerDiv}>
                <p style={WeatherViewStyle.render24.timecolor}>{hours}</p>
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <img src={icon} style={WeatherViewStyle.render24.icon.style} />
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <p style={WeatherViewStyle.render24.tempColor}>{degree}</p>
              </div>
            </Row>
          </Col>
        );
        cols.push(colItem);
      }
    }
    return (
      <Row width={WeatherViewStyle.render24.container.width}>
        {cols}
      </Row>
    );
  }

  getDayInStr(datetime) {
    let day =  datetime.getDay();
    switch(day){
      case 0 : return this.state.strings.sunday; 
      case 1 : return this.state.strings.monday;
      case 2 : return this.state.strings.tuesday;
      case 3 : return this.state.strings.wednesday;
      case 4 : return this.state.strings.thursday;
      case 5 : return this.state.strings.friday;
      case 6 : return this.state.strings.saturday;
      default : console.log("wrong day information"); return null;
    }
  }

  renderForecastList() {
    if(this.state.forecast.length < 1) return null;
    let listItems = [];
    let jump = 8;
    const Styles = WeatherViewStyle.forecast;
    const centerDiv = {CenterDivW100Style};
    const imageWidth = Styles.image.style;
    const fontColor = Styles.text.style;
    let minTemp = 9999;
    let maxTemp = 0;
    let prevdt = new Date(this.state.forecast[0].dt * 1000);
    let current = new Date();
    let weatherIcon = "";
    let needUpdate = false;

    for(let i = 0; i < this.state.forecast.length; i++) {
      let item = this.state.forecast[i];
      let dt = new Date(item.dt * 1000);

      if(current.getDate() == dt.getDate() || prevdt.getDate() == current.getDate()) {
        // skip today
        prevdt = dt;
        continue;
      }

      if(dt.getHours() == 12) { 
        weatherIcon = "img/weather/" + item.weather[0].icon + ".png";
        needUpdate = true;
      }
      if(prevdt.getDate() != dt.getDate()) {
        // a new day, should update minTemp and maxTemp and add 
        let listitem = (
          <div key={"weather-list-" + i} style={Styles.container.style}>
            <Row>
              <Col width={Styles.cols.col1.width}>
                <div style={centerDiv}>
                  <p style={fontColor}>{prevdt.getDate() + " (" + this.getDayInStr(prevdt) + ")"}</p>
                </div>
              </Col>
              <Col width={Styles.cols.col2.width}>
                <div style={centerDiv}><img src={weatherIcon} style={imageWidth} /></div>
              </Col>
              <Col width={Styles.cols.col3.width}>
                <div style={centerDiv}>
                  <p style={fontColor}>
                    {(minTemp - 273.15).toFixed(1) + " / " + (maxTemp - 273.15).toFixed(1)}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        );
        listItems.push(listitem);
        minTemp = 9999;
        maxTemp = 0;
        needUpdate = false;
      }

      if(minTemp > item.main.temp) minTemp = item.main.temp;
      if(maxTemp < item.main.temp) maxTemp = item.main.temp;

      prevdt = dt;
    }

    // last one
    if(needUpdate) {
      let item = (
        <div key={"weather-list-last"} style={Styles.container.style}>
          <Row>
            <Col width={Styles.cols.col1.width}>
              <div style={centerDiv}>
                <p style={fontColor}>{prevdt.getDate() + " (" + this.getDayInStr(prevdt) + ")"}</p>
              </div>
            </Col>
            <Col width={Styles.cols.col2.width}>
              <div style={centerDiv}><img src={weatherIcon} style={imageWidth}/></div>
            </Col>
            <Col width={Styles.cols.col3.width}>
              <div style={centerDiv}>
                <p style={fontColor}>
                  {(minTemp - 273.15).toFixed(1) + " / " + (maxTemp - 273.15).toFixed(1)}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      );
      listItems.push(item);
    }

    return (
      <div>
        {listItems}
      </div>
    );
  }

  render() {
    let forecast24 = this.render24Forecast();
    const current = new Date();
    let forecastList = this.renderForecastList();

    return (
      <div style={CenterDivStyle}>
        <h2 style={WeatherViewStyle.topforecast.title.style}>{this.state.strings.jeju}</h2>
        <h4>
          {current.getFullYear() + "/" + (current.getMonth() + 1) + 
            "/" + current.getDate() + " " + this.getDayInStr(current)}
        </h4>
        <Row>
          <Col width="30%"></Col>
          <Col width="10%">
            <img src={this.state.cache.weatherIcon} style={WeatherViewStyle.topforecast.icon.style}/>
          </Col>
          <Col width="30%">
            <p style={WeatherViewStyle.topforecast.temp.style}>
              {this.state.cache.weatherDegree + "ºC"}
            </p>
          </Col>
          <Col width="30%"></Col>
        </Row>
        <div style={WeatherViewStyle.render24.bgground.style}>
          {forecast24}
        </div>
        <div style={WeatherViewStyle.forecast.bgground.style}>
          {forecastList}
        </div>
      </div>
    )
  }
}
 
