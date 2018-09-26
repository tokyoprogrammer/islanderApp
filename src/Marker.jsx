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
    if((this.props.map !== prevProps.map) ||
       (this.props.position !== prevProps.positon) ||
       (this.props.id !== prevProps.id)) {
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
      map, google, position, mapCenter, color, zIndex, onClick, id, text
    } = this.props;
    
    let pos = position || mapCenter;
    position = new google.maps.LatLng(pos.lat, pos.lng);
/*
    let icon = {
      path: "m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z",
      fillColor: "#" + color,
      fillOpacity: 1,
      anchor: new google.maps.Point(0, 0),
      strokeWeight: 0,
      scale: 0.5
    };
*/
    let icon = "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + text + "|" + color;

    const pref = {
      map: map,
      position: position,
      icon: icon,
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
  google: React.PropTypes.object,
  mapCenter: React.PropTypes.object,
  color: React.PropTypes.string,
  zIndex: React.PropTypes.number,
  id: React.PropTypes.number,
  onClick: React.PropTypes.func,
  text: React.PropTypes.string
}
