import React, { Component } from 'react';
import ReactDOM from 'react-dom'

export default class Marker extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.renderMarker(); 
  }

  componentDidUpdate(prevProps) {
    if ((this.props.map !== prevProps.map) ||
      (this.props.position !== prevProps.positon)) {
      // The relevant props have changed
      if(this.marker) {
        this.marker.setMap(null); // clear Marker
      }
      this.renderMarker();
    }
  }

  componentWillUnmount() {
    if(this.marker) {
      this.marker.setMap(null); // clear Marker
    }
  }

  renderMarker() {
    let {
      map, google, position, mapCenter
    } = this.props;
    
    let pos = position || mapCenter;
    position = new google.maps.LatLng(pos.lat, pos.lng);

    const pref = {
      map: map,
      position: position
    };
    this.marker = new google.maps.Marker(pref);
  }

  render() {
    return null;
  }
}

Marker.propTypes = {
  positon: React.PropTypes.object,
  map: React.PropTypes.object
}
