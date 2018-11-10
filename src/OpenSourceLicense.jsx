import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem} from 'react-onsenui';

import {CenterDivW100Style, ToolbarStyle} from './Styles';

export default class OpenSourceLicense extends React.Component {
  constructor(props) {
    super(props);
    this.licenseList = require("./license.json");
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
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={CenterDivW100Style}>
          <h2><b>Open Source License</b></h2>
        </div>
        <div style={{marginTop: "2%", textAlign: "center", width: "100%", wordWrap: "break-word"}}>
          {this.licenseList.map((item, index) => (
            <div>
              <p key={"license-name-" + index}><b>{item.name}</b></p>
              <p key={"license-url-" + index}>{item.url}</p>
              <p key={"license-desc-" + index}>{item.desc}</p>
              <br />
            </div>
          ))}
        </div>
      </Page>
    );
  }
}
