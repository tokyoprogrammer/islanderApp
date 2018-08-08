import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class GooglePlaceImageView extends React.Component {
  constructor(props) {
    super(props);
    let currentCache = JSON.parse(localStorage.getItem("google-image-cached"));
    let cacheValidUntil = new Date();
    cacheValidUntil.setDate(cacheValidUntil.getDate() + 1);
    // default
    let cached = {
      createdDateTime: cacheValidUntil,
      data: []
    };
 
    if(currentCache != null) {
      let cacheValidUntil = new Date(currentCache.createdDateTime);
      cacheValidUntil.setDate(cacheValidUntil.getDate() + 1); 
      // cache will be valid until + 1 day of the created day.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
        // compare and if cache is fresh
        cached = currentCache;
      } else {
        localStorage.getItem("google-image-cached", JSON.stringify(cached));
      }
    } else {
      localStorage.getItem("google-image-cached", JSON.stringify(cached));
    }

    this.state = {
      cached: cached,
      url: "img/noimage.png",
    }
  }

  componentDidMount() {
    this.loadImage(); 
  }
 
  componentDidUpdate(prevProps) {
    if(this.props.placeTitle != prevProps.placeTitle) {
      console.log("update");
      this.loadImage();
    }   
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
    console.log(this.props);
    if (this.props) {
      console.log("called2");
      const placeTitle = this.props.placeTitle;
      let cached = this.state.cached.data;
      // find cache first
      for(let i = 0 ; i < cached.length; i++) {
        let cacheItem = cached[i];
        if(placeTitle == cacheItem.title) {
          // found
          console.log("Found")
          this.setState({url: cacheItem.url});
          return;
        }
      }
      if(this.props.google) {
        // if not found, load image using google api
        this.loadImageUsingGoogleAPI();
      }
    }
  }

  storeIntoCache(title, url) {
    let cached = this.state.cached.data.slice(0);
    cached.push({title: title, url: url});
    let cachedToStore = {
      createdDateTime: this.state.cached.createdDateTime,
      data: cached
    };
      
    localStorage.setItem("google-image-cached", JSON.stringify(cachedToStore));
    return cachedToStore;
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
    let imgTag = this.props.listThumbnail == true ? 
      (<img src = {this.state.url} 
        style={{width: this.props.maxWidth + "px", maxHeight: this.props.maxHeight + "px"}} />) :
      (<img src = {this.state.url} style={{width: "100%"} }/>);
    return (
      <div style={{width: "100%", height: "100%"}}>
        <div ref="map"></div>
        <div>{imgTag}</div>
      </div>
    );
  }
}

GooglePlaceImageView.propTypes = {
  google: React.PropTypes.object,
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  placeTitle: React.PropTypes.string,
  listThumbnail: React.PropTypes.bool
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ'
})(GooglePlaceImageView)