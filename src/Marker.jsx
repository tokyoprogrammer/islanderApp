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
      map, google, position, mapCenter, color, zIndex, onClick, id
    } = this.props;
    
    let pos = position || mapCenter;
    position = new google.maps.LatLng(pos.lat, pos.lng);

    let image = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color;

    const pref = {
      map: map,
      position: position,
      icon: image,
      zIndex: zIndex
    };
    this.marker = new google.maps.Marker(pref);
    
    this.marker.addListener('click', function(e) {
      onClick(e, id);
    });
  }
  
  render() {
    return null;
  }
}

Marker.propTypes = {
  positon: React.PropTypes.object,
  map: React.PropTypes.object,
  color: React.PropTypes.string,
  zIndex: React.PropTypes.number,
  id: React.PropTypes.number,
  onClick: React.PropTypes.func
}
