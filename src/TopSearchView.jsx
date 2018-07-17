import React from 'react';
import ReactDOM from 'react-dom';
import {Button, SearchInput, Icon} from 'react-onsenui';

export default class TopSearchView extends React.Component {
  constructor(props) { 
    super(props);
  }

  render() {
    const innerDiv = {
      margin: '1%'
    };
    const searchIconSize = {
      default: 24,
      material: 22
    };

    return (
      <div style={innerDiv}>
        <SearchInput
          placeholder='Search...' onChange={this.props.onChange} />
        <Button onClick={this.props.onClick} 
          modifier='quiet' style={{margin: '2px', padding: '2px'}}>
          <Icon icon='md-search' size={searchIconSize} />
        </Button>
      </div>
    );
  }
}

TopSearchView.propTypes = {
  onChange: React.PropTypes.func,
  onClick: React.PropTypes.func
}
