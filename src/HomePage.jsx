import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button} from 'react-onsenui';

import MapView from './MapView'; 

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  pushPage(code) {
    this.props.navigator.pushPage({ 
      component: MapView, 
      props: { 
        key: MapView.name, 
        code: code, 
        strings:this.props.strings } 
    });
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    const imgStyle= {
      height: '35%',
      marginTop: '5%'
    };

    return (
      <Toolbar>
        <div className="center">
        Islander Jeju <img src="img/milgam.png" style={imgStyle} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon icon='ion-navicon, material:md-menu' />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  render() {
    const buttonStyle = {
      margin: '3%',
      width: '40%'
    };

    const imageStyle = {
      width: '100%'
    };

    const divCenter = {
      textAlign: 'center'
    };

    const sightCode = 12; 
    const cultureCode = 14;
    const festivalCode = 15;
    const activityCode = 28;
    const shoppingCode = 38;
    const foodsCode = 39;

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, sightCode)}>
            <img src="img/sightseeing.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.sight}</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, cultureCode)}>
            <img src="img/culture.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.art}</p>
            </div>
          </Button>
        </div>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, festivalCode)}>
            <img src="img/festival.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.festival}</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, activityCode)}>
            <img src="img/activity.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.activity}</p>
            </div>
          </Button>
        </div>
        <div style={divCenter}>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, shoppingCode)}>
            <img src="img/shopping.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.shopping}</p>
            </div>
          </Button>
          <Button style={buttonStyle} modifier='quiet' onClick={this.pushPage.bind(this, foodsCode)}>
            <img src="img/food.png" style={imageStyle} />
            <br/>
            <div style={divCenter}>
              <p>{this.props.strings.foods}</p>
            </div>
          </Button>
        </div>
      </Page>
    );
  }
}
