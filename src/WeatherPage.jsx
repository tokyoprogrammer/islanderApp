import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import WeatherView from './WeatherView';
import {ToolbarStyle} from './Styles';

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
    return (
      <Toolbar>
        <div className="left"><BackButton></BackButton></div>
        <div className="center">
          <img src={ToolbarStyle.title.imgs.logo.url} style={ToolbarStyle.title.imgs.logo.style} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon size={ToolbarStyle.menu.size} icon={ToolbarStyle.menu.icon} />
          </ToolbarButton>
        </div>
     </Toolbar>
    );
  }

  render() {
    const centerDiv = {textAlign: "center"};
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={{height: "100%"}}>
          <WeatherView />
        </div>
      </Page>
    );
  }
}
