import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class GoogleSearchField extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadMap(); 
  }

  loadMap() {
    if (this.props && this.props.google) { 
      const {google} = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map; 
      const node = ReactDOM.findDOMNode(mapRef); 
      let {initialCenter, zoom} = this.props;
      const {lat,lng} = initialCenter;
      const center = new maps.LatLng(lat, lng);

      const mapConfig = Object.assign({}, {
        center: center, 
        zoom: zoom, 
        mapTypeId: 'roadmap',
        gestureHandling: 'cooperative'
      })

      this.map = new maps.Map(node, mapConfig);
      let input = document.getElementById('pac-input');
      let defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(33.620437, 126.059291),
        new google.maps.LatLng(33.130070, 127.098672));
      this.searchBox = new maps.places.SearchBox(input, {
        bounds: defaultBounds
      });

      var this_ = this;
      // Bias the SearchBox results towards current map's viewport.
      this.map.addListener('bounds_changed', function() {
        this_.searchBox.setBounds(this_.map.getBounds());
      });

      this.markers = [];
      this.searchBox.addListener('places_changed', this.placeChanged.bind(this));
    }
  }

  onFocus(e) {
    let input = document.getElementById('pac-input');
    input.value='';
  }

  placeChanged() {
    let google = this.props.google;
    let places = this.searchBox.getPlaces();
    if(places.length == 0) {
      return;
    }
    
    this.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    this.markers = [];

    let bounds = new google.maps.LatLngBounds();
    let this_ = this;
    let ret = [];

    places.forEach(function(place) {
      if(!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      this_.markers.push(new google.maps.Marker({
        map: this_.map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      ret.push({
        name: place.name,
        addr: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });

      if(place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    this.map.fitBounds(bounds);
    this.props.onSearchDone(ret);
  }

  render() {
    const style = { 
      width: "95vw",
      height: this.props.height,
      margin: "2.5%"
    }

    return (
      <div style={{textAlign: "center"}}>
        <input id="pac-input" type="text" placeholder="Search Place..." 
          style={{width: "95%", height: "40px", margin: "2.5%", marginBottom: "1%"}} 
          onFocus={this.onFocus.bind(this)}/> 
        <div ref="map" style={style}>
        </div>
      </div>
    )
  }
}

GoogleSearchField.propTypes = {
  google: React.PropTypes.object,
  zoom: React.PropTypes.number,
  initialCenter: React.PropTypes.object,
  height: React.PropTypes.string,
  onSearchDone: React.PropTypes.func
}
GoogleSearchField.defaultProps = {
  zoom: 9,
  initialCenter: {
    lat: 33.356432,
    lng: 126.5268767
  },
}

export default GoogleApiWrapper((props) => ({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ',
}))(GoogleSearchField)
