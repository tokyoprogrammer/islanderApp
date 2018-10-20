import React from 'react';
import ReactDOM from 'react-dom';
import {Icon} from 'react-onsenui';
import SearchField from "react-search-field" ;

require('./searchfield.css');

export default class TopSearchView extends React.Component {
  constructor(props) { 
    super(props);
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
      textAlign: "center"
    };
    const searchIconSize = {
      default: 24,
      material: 22
    };

    return (
      <div style={innerDiv}>
        <SearchField
          style={{height: "60px"}}
          placeholder="Search..."
          onChange={this.props.onChange} 
          onEnter={this.onEnter.bind(this)}
          onSearchClick={this.onSearchClick.bind(this)} />
      </div>
    );
  }
}

TopSearchView.propTypes = {
  onChange: React.PropTypes.func,
  onClick: React.PropTypes.func
}
