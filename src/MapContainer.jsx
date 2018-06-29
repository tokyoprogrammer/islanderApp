import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {ProgressCircular} from 'react-onsenui';

import {GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {lat: 33.356432, lng: 126.5268767}
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
      const mapConfig = Object.assign({}, {
        center: this.state.center, 
        zoom: 9, 
        mapTypeId: 'roadmap' 
      })

      this.map = new maps.Map(node, mapConfig); 
    }
  }

  render() {
    const style = { 
      width: '100vw',
      height: '45vh'
    }

    return ( 
      <div ref="map" style={style}>
        <ProgressCircular indeterminate />
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ',
})(MapContainer)
