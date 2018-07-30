import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class GooglePlaceImageView extends React.Component {
  constructor(props) {
    super(props);
    let cached = JSON.parse(localStorage.getItem("google-image-cached"));
    if(!cached) {
      cached = [];
      localStorage.setItem("google-image-cached", JSON.stringify(cached));
    }

    this.state = {
      cached: cached,
      url: "img/noimage.png",
    }
  }

  componentDidMount() {
    this.loadImage(); 
  }
 
  loadImageUsingGoogleAPI() {
    const {placeTitle, google} = this.props;
    var request = {
      query: placeTitle,
      fields: ['photos']
    };
    const mapRef = this.refs.map; 
    const node = ReactDOM.findDOMNode(mapRef); 
 
    var service = new google.maps.places.PlacesService(node);
    service.findPlaceFromQuery(request, this.searchDone.bind(this)); 
  }

  loadImage() {
    if (this.props && this.props.google) {
      const placeTitle = this.props.placeTitle;
      let cached = this.state.cached;
      // find cache first
      for(let i = 0 ; i < cached.length; i++) {
        let cacheItem = cached[i];
        if(placeTitle == cacheItem.title) {
          // found
          this.setState({url: cacheItem.url});
          return;
        }
      }
      // if not found, load image using google api
      this.loadImageUsingGoogleAPI();
    }
  }

  storeIntoCache(title, url) {
    let cached = this.state.cached.slice(0);
    cached.push({title: title, url: url});
    localStorage.setItem("google-image-cached", JSON.stringify(cached));
    return cached;
  }

  searchDone(results, status) {
    let google = this.props.google;
    if(status == google.maps.places.PlacesServiceStatus.OK) {
     for(let i = 0; i < results.length; i++) {
        let place = results[i];
        let photos = place.photos;
        if(!photos) {
          // in this case, may be able to be updated later.
          this.setState({url: "img/noimage.png"});
          return;
        }
        let {maxWidth, maxHeight} = this.props;
        let url = photos[0].getUrl({'maxWidth': maxWidth, 'maxHeight': maxHeight});
        if(url) {
          // store into cache
          let cached = this.storeIntoCache(this.props.placeTitle, url);
          this.setState({cached: cached, url: url});
          
          return;
        } else {
          // no reason. maybe we can try it later
          this.setState({url: "img/noimage.png"});
          return;
        }
      }
      // okay but no results?
      this.setState({url: "img/noimage.png"});
    } else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
      // cannot find results. This place is not stored in the google map. 
      // store into cache with no image
      let cached = this.storeIntoCache(this.props.placeTitle, "img/noimage.png");
      this.setState({cached: cached, url: "img/noimage.png"});
      return;
    } else {
      // unknown status
      console.log(status);
      this.setState({url: "img/noimage.png"});
    }
  }
  
  render() {
    return (
      <div style={{width: "100%", height: "100%"}}>
        <div ref="map"></div>
        <div><img src = {this.state.url} style={{width: this.props.maxWidth}} /></div>
      </div>
    );
  }
}

GooglePlaceImageView.propTypes = {
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  placeTitle: React.PropTypes.string,
}

export default GoogleApiWrapper((props) => ({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ',
}))(GooglePlaceImageView)
