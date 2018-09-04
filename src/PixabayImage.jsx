import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class PixabayImage extends React.Component {
  constructor(props) {
    super(props);
    let currentCache = JSON.parse(localStorage.getItem("pixabay-image-cached"));
    let cacheValidUntil = new Date();
    cacheValidUntil.setHours(cacheValidUntil.getHours() + 1);
    
    let cached = {
      createdDateTime: cacheValidUntil,
      data: []
    };

    console.log()
    if(currentCache != null) {
      let cacheValidUntil = new Date(currentCache.createdDateTime);
      cacheValidUntil.setHours(cacheValidUntil.getHours() + 1);
 
      // cache will be valid until + 1 day of the created day.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
        // compare and if cache is fresh
        cached = currentCache;
      } else {
        localStorage.setItem("pixabay-image-cached", JSON.stringify(cached));
      }
    } else {
      localStorage.setItem("pixabay-image-cached", JSON.stringify(cached));
    }

    this.state = {
      cached: cached,
      url: ""
    }
  }

  componentDidMount() {
    this.loadImage(); 
  }

  storeIntoCache(data) {
    let cachedToStore = {
      createdDateTime: this.state.cached.createdDateTime,
      data: data
    };
    localStorage.setItem("pixabay-image-cached", JSON.stringify(cachedToStore));
    return cachedToStore;
  }

  loadImageUsingPixabayAPI() {
    var this_ = this;
    const key = "9995637-0ccd160d0f89b528d825ac3e7";
    const queryURL = "https://pixabay.com/api/?key=" + key + 
      "&q=%EC%A0%9C%EC%A3%BC%EB%8F%84&lang=ko&" + 
      "image_type=photo&safesearch=true&per_page=200" +
      "editors_choice=true"
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let data = JSON.parse(xhr.responseText);
        let cached = this_.storeIntoCache(data.hits);
        let rand = this_.getRandNum(cached.data.length);
        console.log(cached);
        let url = cached.data[rand].largeImageURL;
        console.log(url);
        this_.setState({cached: cached, url: url});
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('Load Detail Common failed'));
      }
      xhr.open('GET', queryURL);
      xhr.send(null);
    });
  }

  getRandNum(max) {
    const min = 0;
    return Math.round(min + Math.random() * (max - min));
  }

  loadImage() {
    if(this.state.cached.data.length > 0) {
      let rand = this.getRandNum(this.state.cached.data.length);
      let url = this.state.cached.data[rand].largeImageURL;
      this.setState({url: url});
    } else {
      this.loadImageUsingPixabayAPI();
    }
  }

  render() {
    return (
      <img src={this.state.url} style={{width: "100%"}} 
        onError={(e)=>{e.target.src="img/bkground/default.jpg"}} />
    );
  }
}
