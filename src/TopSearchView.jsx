import React from 'react';
import ReactDOM from 'react-dom';
import {Icon} from 'react-onsenui';

import {TopSearchViewStyle} from './Styles';

export default class TopSearchView extends React.Component {
  constructor(props) { 
    super(props);
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  onKeyPressed(event) {
    if(event.key == 'Enter')
      this.props.onClick();
  }

  onSearchClick(value) {
    this.props.onClick();
  }

  render() {
    const innerDiv = TopSearchViewStyle.innerDiv.style;
    const inputField = TopSearchViewStyle.input.style;
    const searchButton = TopSearchViewStyle.searchBtn.style;
    const iconStyle = TopSearchViewStyle.searchBtn.icon.style;

    return (
      <div style={innerDiv}>
        <input style={inputField} 
          onChange={this.onChange.bind(this)} 
          placeholder="search..." 
          onKeyPress={this.onKeyPressed.bind(this)}/>
        <button style={searchButton} onClick={this.onSearchClick.bind(this)}>
          <img src={TopSearchViewStyle.searchBtn.icon.img} style={iconStyle} />
        </button>
      </div>
    )
  }
}

TopSearchView.propTypes = {
  onChange: React.PropTypes.func,
  onClick: React.PropTypes.func
}
