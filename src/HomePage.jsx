import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button} from 'react-onsenui';

import MapView from './MapView';
import PixabayImage from './PixabayImage';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  pushPage(code) {
    localStorage.setItem("code", code);
    this.props.navigator.pushPage({ 
      component: MapView 
    });
  }

  showMenu() {
    this.props.showMenu();
  }

  changeLanguage() {
    let lang = this.props.strings.getLanguage();
    if(lang == 'kr') {
      this.props.strings.setLanguage('en');
      localStorage.setItem('lang', 'en');
    } else {
      this.props.strings.setLanguage('kr');
      localStorage.setItem('lang', 'kr');
    }
    this.setState({});
  }

  renderToolbar() {
    const imgStyle = {
      height: '15px',
      marginTop: '5%'
    };
    
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/english.png" 
         style={{width: "33px"}}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/korean.png" 
         style={{width: "33px"}}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
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

    const isKr = this.props.strings.getLanguage() == 'kr' ? true : false;
    
    let sightCode = isKr ? 12 : 76; 
    let cultureCode = isKr ? 14 : 78;
    let festivalCode = isKr ? 15 : 85;
    let activityCode = isKr ? 28 : 75;
    let shoppingCode = isKr ? 38 : 79;
    let foodsCode = isKr ? 39 : 82;

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <PixabayImage />
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
