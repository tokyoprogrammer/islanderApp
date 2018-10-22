import React from 'react';
import ReactDOM from 'react-dom';
import {Icon} from 'react-onsenui';

export default class TopSearchView extends React.Component {
  constructor(props) { 
    super(props);
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  onEnter(value, event) {
    this.props.onClick();
  }

  onSearchClick(value) {
    this.props.onClick();
  }

  render() {
    const innerDiv = {
      margin: '1%',
      textAlign: "center",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    };
    const inputField = {
      WebkitAppearance: "none",
      width: "78%", 
      height: "50px", 
      padding: "0px", 
      border: "1px solid #D3D3D3",
      borderRightStyle: "none",
      fontSize: "15px",
      textIndent: "3%"
    };
    const searchButton = {    
      border: "1px solid #D3D3D3",
      backgroundColor: "white",
      color: "black",
      height: "50px",
      width: "50px",
      padding: "0px",
      paddingLeft: "1%"
    };
    const iconStyle = {
      width: "20px"
    };

    return (
      <div style={innerDiv}>
        <input style={inputField} onChange={this.onChange.bind(this)} placeholder="search..." />
        <button style={searchButton} onClick={this.onSearchClick.bind(this)}>
          <img src="img/search.png" style={iconStyle} />
        </button>
      </div>
    )
  }
}

TopSearchView.propTypes = {
  onChange: React.PropTypes.func,
  onClick: React.PropTypes.func
}
