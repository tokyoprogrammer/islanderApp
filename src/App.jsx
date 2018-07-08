import React from 'react';
import ReactDOM from 'react-dom';
import {Navigator, Splitter, SplitterSide, SplitterContent, Page, Button, List, ListItem, Icon} from 'react-onsenui';
import LocalizedStrings from 'react-localization';

import HomePage from './HomePage';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);

    this.state = {
      isOpen: false,
      strings: strings
    };

    let lang = localStorage.getItem('lang');
    if(lang == null) {
      localStorage.setItem('lang', 'kr');
      strings.setLanguage("kr");
    } else {
      strings.setLanguage(lang);
    }
  }


  loadPage(page) {
    this.hide();
    const currentPage = this.navigator.pages.slice(-1)[0] // --- or [this.navigator.pages.length - 1]
    if(currentPage.key != page.name){
      this.navigator.resetPage({ 
        component: page, 
        props: { key: page.name, strings: this.state.strings } }, 
        { animation: 'fade' });
    }
  }

  show() {
    this.setState({
      isOpen: true
    });
  }

  hide() {
    this.setState({
      isOpen: false
    });
  }
  
  renderPage(route, navigator) {
    route.props = route.props || {};
    route.props.navigator = navigator;
    route.props.showMenu = this.show.bind(this);

    return React.createElement(route.component, route.props);
  }
  
  render() {
    const imageStyle = {
      width: '40%',
      marginLeft: '30%',
      marginRight: '30%',
      marginBotton: '4%',
      marginTop: '4%'
    };

    const divCenter = {
      textAlign: 'center'
    };

    const imageSmall = {
      marginTop: '5px',
      height: '20px'
    };

    const listDiv = {
      height: '20px'
    };

    return (
      <Splitter>
        <SplitterSide
          side='right'
          collapse={true}
          isOpen={this.state.isOpen}
          onClose={this.hide.bind(this)}
          swipeable={false}>
          <Page>
            <img src="img/islander.png" 
              className="center" 
              style={imageStyle} />
            <div style={divCenter} >
              <h3>Islander <Icon icon='plane' style={{color: '#00CED1'}}/> </h3>
              <h3>Jeju <img src="img/milgam.png" style={imageSmall} /></h3> 
            </div>
            <List>
              <ListItem key={App.name} onClick={this.loadPage.bind(this, App)} tappable>
                <div style={listDiv}>{this.state.strings.home}</div>
              </ListItem>
            </List>
          </Page>
        </SplitterSide>
        <SplitterContent>
          <Navigator 
            initialRoute={{ 
              component: HomePage, 
              props: { key: HomePage.name, strings: this.state.strings } }} 
            renderPage={this.renderPage.bind(this)}
            ref={(navigator) => { this.navigator = navigator; }} />
        </SplitterContent>
      </Splitter>
    );
  }
}
