import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class PixabayImage extends React.Component {
  constructor(props) {
    super(props);

    this.maxLen = 45;
    let rand = this.getRandNum(this.maxLen);

    this.state = {
      url: "img/bkground/" + rand + ".jpg"
    }
  }

  getRandNum(max) {
    const min = 1;
    return Math.round(min + Math.random() * (max - min));
  }

  render() {
    return (
      <img src={this.state.url} style={{width: "100%", height: "200px", objectFit: "cover"}} 
        onError={(e)=>{e.target.src="img/bkground/1.jpg"}} />
    );
  }
}
