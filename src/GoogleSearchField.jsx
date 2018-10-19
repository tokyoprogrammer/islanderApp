import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class GoogleSearchField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    };
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
      this.searchBox = new maps.places.Autocomplete(input, {
        componentRestrictions: {'country': 'kr'}
      });

      this.searchBox.bindTo('bounds', this.map);
      this.searchBox.setTypes([]);
      this.searchBox.setFields(
        ['address_components', 'geometry', 'icon', 'name', 'types', 'formatted_address']);

      this.infoWindow = new maps.InfoWindow();
      this.infoWindowContent = document.getElementById('infowindow-content');
      this.infoWindow.setContent(this.infoWindowContent);

      this.marker = new maps.Marker({
        map: this.map,
        anchorPoint: new maps.Point(0, -29)
      });

      this.searchBox.addListener('place_changed', this.placeChanged.bind(this));
    }
  }

  placeChanged() {
    this.infoWindow.close();
    this.marker.setVisible(false);

    let place = this.searchBox.getPlace();
    console.log(place);
    if(!place.geometry) {
      return;
    }

    if(!place.types.includes("lodging")) {
      console.log("This is not an accomodation.");
    }

    if(place.geometry.viewport) {
      this.map.fitBounds(place.geometry.viewport);
    } else {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(17); // Why 17? Because it looks good.
    }

    this.marker.setPosition(place.geometry.location);
    this.marker.setVisible(true);

    let address = '';
    if(place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
  
    document.getElementById('place-icon').src = place.icon;
    document.getElementById('place-name').textContent = place.name;
    document.getElementById('place-address').textContent = address;
    this.infoWindow.open(this.map, this.marker);

    let ret = [];
    ret.push({
      name: place.name,
      addr: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });

    this.props.onSearchDone(ret);

  }

  onFocus(e) {
    let input = document.getElementById('pac-input');
    input.value='';
  }

  render() {
    const style = { 
      width: "95vw",
      height: this.props.height,
      margin: "2.5%"
    }

    return (
      <div style={{textAlign: "center"}}>
        <input id="pac-input" type="text" 
          style={{width: "95%", height: "30px"}} 
          onFocus={this.onFocus.bind(this)}/> 
        <div ref="map" style={style}>
        </div>
        <div id="infowindow-content">
          <img src="" style={{width: "16px", height: "16px"}} id="place-icon" />
          <b id="place-name"></b><br />
          <p id="place-address"></p>
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
