import React, { Component } from 'react';
import ReactDOM from 'react-dom'

export default class GooglePlaceImageContainer extends React.Component {
  constructor(props) {
    super(props);
    let cached = JSON.parse(localStorage.getItem("google-image-cached"));
    if(!cached) {
      cached = [];
      localStorage.setItem("google-image-cached", JSON.stringify(cached));
    }

    this.state = {
      cached: cached,
      url: ""
    }
  }

  componentDidMount() {
    this.loadImage(); 
  }
  
  componentDidUpdate() {
    this.loadImage();
  }

  loadImageUsingGoogleAPI() {
    const {map, google, placeTitle} = this.props;

    var request = {
      query: placeTitle,
      fields: ['photos']
    };
    
    var service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery(request, this.searchDone.bind(this));
  }

  loadImage() {
    if (this.props && this.props.google) {
      const {map, google, placeTitle} = this.props;
      let cached = this.state.cached;
      // find cache first
      for(let i = 0 ; i < cached.length; i++) {
        let cacheItem = cached[i];
        if(placeTitle == cacheItem.title) {
          // found
          this.props.onFound(cacheItem.url, this.props.imageId);
          return;
        }
      }
      // if not found, load image using google api
      this.loadImageUsingGoogleAPI();
    }
  }
  
  searchDone(results, status) {
    let google = this.props.google;
    if(status == google.maps.places.PlacesServiceStatus.OK) {
      for(let i = 0; i < results.length; i++) {
        let place = results[i];
        let photos = place.photos;
        if(!photos) return;
        let {maxWidth, maxHeight} = this.props;
        let url = photos[0].getUrl({'maxWidth': maxWidth, 'maxHeight': maxHeight});
        if(url) {
          // store into cache
          let cached = this.state.cached.slice(0);
          cached.push({title: this.props.placeTitle, url: url});
          localStorage.setItem("google-image-cached", JSON.stringify(cached));
          this.setState({cached: cached, url: url});
          
          this.props.onFound(url, this.props.imageId);
          return;
        }
      }
    }
  }
  
  render() {
    if(this.state.url != "") {
      return (<img src = {this.state.url} style={{width: "100%"}} />);
    }
    return null;
  }
}

GooglePlaceImageContainer.propTypes = {
  map: React.PropTypes.object,
  google: React.PropTypes.object,
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  placeTitle: React.PropTypes.string,
  imageId: React.PropTypes.string,
  onFound: React.PropTypes.func
}
