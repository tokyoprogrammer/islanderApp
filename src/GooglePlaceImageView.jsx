import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import {Carousel, CarouselItem} from 'react-onsenui';
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
      urls: [],
      counter: 0
    }
  }

  componentDidMount() {
    this.loadImage(); 
  }
 
  componentDidUpdate(prevProps) {
    if(this.props.placeTitle != prevProps.placeTitle) {
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
    if (this.props) {
      const placeTitle = this.props.placeTitle;
      let cached = this.state.cached.data;
      // find cache first
      for(let i = 0 ; i < cached.length; i++) {
        let cacheItem = cached[i];
        if(placeTitle == cacheItem.title) {
          // found
          this.setState({url: cacheItem.url, urls: cacheItem.urls});
          return;
        }
      }
      if(this.props.google) {
        // if not found, load image using google api
        this.loadImageUsingGoogleAPI();
      }
    }
  }

  storeIntoCache(title, url, urls) {
    let cached = this.state.cached.data.slice(0);
    cached.push({title: title, url: url, urls: urls});
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
          this.setState({url: "img/noimage.png", urls: ["img/noimage.png"]});
          return;
        }
        const width = 800;
        const height = 800;
        let url = photos[0].getUrl({'maxWidth': width, 'maxHeight': height});
        if(url) {
          let urls = [];
          for(let j = 0; j < photos.length; j++) {
            let url = photos[j].getUrl({'maxWidth': width, 'maxHeight': height});
            urls.push(url);
          }
          // store into cache
          let cached = this.storeIntoCache(this.props.placeTitle, url, urls);
          this.setState({cached: cached, url: url, urls: urls});
          
          return;
        } else {
          // no reason. maybe we can try it later
          this.setState({url: "img/noimage.png", urls: ["img/noimage.png"]});
          return;
        }
      }
      // okay but no results?
      this.setState({url: "img/noimage.png", urls: ["img/noimage.png"]});
    } else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
      // cannot find results. This place is not stored in the google map. 
      // store into cache with no image
      let cached = this.storeIntoCache(this.props.placeTitle, "img/noimage.png", ["img/noimage.png"]);
      this.setState({cached: cached, url: "img/noimage.png", urls: ["img/noimage.png"]});
      return;
    } else {
      // unknown status
      console.log(status);
      this.setState({url: "img/noimage.png", urls: ["img/noimage.png"]});
    }
  }
  
  handleChange(e) {
    this.setState({counter: e.activeIndex});
  }

  drawCarousel() {
    let carouselItems = [];

    for(let i = 0; i < this.state.urls.length; i++) {
      let key = "google-img-" + i;
      let imageSrc = this.state.urls[i];
      let carouselItem = (
        <CarouselItem key={key}>
          <img src = {imageSrc} style={{width: "100%"}}/>
          <div style={{width: "100%", position: "absolute", textAlign: "center", 
            fontSize: "10px", top: "5%", left: '0px', right: '0px'}}>
              {this.state.urls.map((item, index) => (
                <span key={index} style={{cursor: 'pointer'}}>
                  {this.state.counter === index && this.state.urls.length > 1 ? '\u25CF' : '\u25CB'}
                </span>
              ))}
          </div>
        </CarouselItem>
      );
      carouselItems.push(carouselItem);
    }



    return (
      <Carousel swipeable autoScroll overscrollable autoScrollRatio={0.5} index={this.state.counter}
        onPostChange={this.handleChange.bind(this)}>
        {carouselItems}
      </Carousel>
    );
  }

  render() {
    let imgTag = null;

    if(this.props.multi == false) {
      imgTag = this.props.listThumbnail == true ? 
        (<img src = {this.state.url} 
          style={{width: this.props.maxWidth + "px", maxHeight: this.props.maxHeight + "px"}} />) :
        (<img src = {this.state.url} style={{width: "100%"}}/>);
    } else {
      imgTag = this.drawCarousel();
    }
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
  listThumbnail: React.PropTypes.bool,
  multi: React.PropTypes.bool
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ'
})(GooglePlaceImageView)
