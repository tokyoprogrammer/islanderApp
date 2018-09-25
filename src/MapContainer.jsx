import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import {GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadMap(); 
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.children !== this.props.children) {
      this.setState({});
    }
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
    }
  }

  renderMarkers() {
    const {children} = this.props;

    if(!children) return;

    if(this.props.drawLine) {
      const {children} = this.props;
      if(this.path) {
        this.path.setMap(null); // clear path
      }
      if(children.length > 1) {
        let positions = [];
        for(let i = 0; i < children.length; i++) {
          const position = children[i].props.position;
          positions.push({
            lat: parseFloat(position.lat),
            lng: parseFloat(position.lng)
          });
        }

        let path = new this.props.google.maps.Polyline({
          path: positions,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        this.path = path;
        path.setMap(this.map);
      }
    } 

    let ret = React.Children.map(children, c => {
      if(c == null) return;
      return React.cloneElement(c, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.props.initialCenter
      });
    });
    return ret;
  }

  render() {
    const style = { 
      width: this.props.width,
      height: this.props.height
    }

    return ( 
      <div ref="map" style={style}>
        {this.renderMarkers()}
      </div>
    )
  }
}

MapContainer.propTypes = {
  google: React.PropTypes.object,
  zoom: React.PropTypes.number,
  initialCenter: React.PropTypes.object,
  width: React.PropTypes.string,
  height: React.PropTypes.string,
  drawLine: React.PropTypes.bool
}
MapContainer.defaultProps = {
  zoom: 9,
  initialCenter: {
    lat: 33.356432,
    lng: 126.5268767
  },
  drawLine: false
}

export default GoogleApiWrapper((props) => ({
  apiKey: 'AIzaSyDQlA7ERwcmbPVr8iFH-QGV8uS-_B6c2jQ',
}))(MapContainer)
