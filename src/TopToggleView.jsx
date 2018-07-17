import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Segment} from 'react-onsenui';

export default class TopToggleView extends React.Component {
  constructor(props) { 
    super(props);
  }

  render() {
    const innerDiv = {
      margin: '1%'
    };

    return (
      <div style={innerDiv}>
        <Segment index={this.props.segmentIndex} 
          onPostChange={this.props.onPostChange} style={{ width: '55%' }}>
          <Button>{this.props.strings.all}</Button>
          <Button>{this.props.strings.seoguipo}</Button>
          <Button>{this.props.strings.jeju}</Button>
        </Segment>
      </div>);
  }
}

TopToggleView.propTypes = {
  index: React.PropTypes.number,
  strings: React.PropTypes.object,
  onPostChange: React.PropTypes.func
}
