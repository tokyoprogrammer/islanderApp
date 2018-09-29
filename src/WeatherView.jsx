import React from 'react';
import ReactDOM from 'react-dom';
import {Icon, Button, List, ListItem, Row, Col} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

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
        console.log(forecast);
        this_.setState({
          forecast: forecast
        });
      });

      return; 
    }

    var this_ = this;
    let URL = "https://api.openweathermap.org/data/2.5/forecast?q=Jeju,kr" + 
      "&appid=8e0c89b8e26008044c73cb82ed5e4d60";
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
    const centerDiv = {textAlign: "center", width: "100%"};
    if(this.state.forecast.length > 8) {
      for(let i = 0; i < 8; i++) {
        let item = this.state.forecast[i];
        let dt = new Date(item.dt * 1000);
        let hours = dt.getHours();
        let icon = "http://openweathermap.org/img/w/" + item.weather[0].icon + ".png";
        let degree = (item.main.temp - 273.15).toFixed(1);
        let colItem = (
          <Col>
            <Row>
              <div style={centerDiv}>
                <p style={{color: "#FFFFFF"}}>{hours}</p>
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <img src={icon} style={{width: "30px"}} />
              </div>
            </Row>
            <Row>
              <div style={centerDiv}>
                <p style={{color: "#FFFFFF"}}>{degree}</p>
              </div>
            </Row>
          </Col>
        );
        cols.push(colItem);
      }
    }
    return (
      <Row width="100%">
        {cols}
      </Row>
    );
  }

  render() {
    const centerDiv = {textAlign: "center"};
    const current = new Date();
    let forecast24 = this.render24Forecast();

    return (
      <div style={centerDiv}>
        <h2>{this.state.strings.jeju}</h2>
        <Row>
          <Col width="35%"></Col>
          <Col width="15%">
            <img src={this.state.cache.weatherIcon} />
          </Col>
          <Col width="15%">
            <h2 style={{marginTop: "9px", marginBottom: "9px"}}>
              {this.state.cache.weatherDegree + "ºC"}
            </h2>
          </Col>
          <Col width="35%"></Col>
        </Row>
        <div style={{borderRadius: "6px", backgroundColor: "rgba(0, 0, 0, .4)", padding: "3%", 
          marginLeft: "2px", marginRight: "2px", marginTop: "5%"}}>
          {forecast24}
        </div>
      </div>
    )
  }
}
 
