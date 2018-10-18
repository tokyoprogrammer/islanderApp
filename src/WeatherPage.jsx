import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import WeatherView from 'WeatherView';

export default class WeatherPage extends React.Component {
  constructor(props) {
    super(props);
    let serviceLang = "";
    let lang = localStorage.getItem("lang");
 
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    this.state = {
      strings: strings
    };
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    const imgStyle= {
      height: '15px',
      marginTop: '5%'
    };

    return (
      <Toolbar>
        <div className="left"><BackButton></BackButton></div>
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
    const centerDiv = {textAlign: "center"};
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={{height: "100%", backgroundColor: "#FFFFFF"}}>
          <WeatherView />
        </div>
      </Page>
    );
  }
}
