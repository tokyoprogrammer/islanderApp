import React from 'react';
import ReactDOM from 'react-dom';
import {Navigator, Splitter, SplitterSide, SplitterContent, Page, Button, List, ListItem, Icon} from 'react-onsenui';
import LocalizedStrings from 'react-localization';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';

library.add(faStroopwafel);

import HomePage from './HomePage';
import CourseRecommandationPage from './CourseRecommandationPage';
import CreateFlightPlanPage from './CreateFlightPlanPage';
import ShowMyPlanPage from './ShowMyPlanPage';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);

    let pageName = localStorage.getItem("pageToLoad");
    this.state = {
      isOpen: false,
      strings: strings,
      page: pageName == "HomePage" ? HomePage : 
        pageName == "CourseRecommandationPage" ? CourseRecommandationPage : 
        pageName == "CreateFlightPlanPage" ? CreateFlightPlanPage : 
        pageName == "ShowMyPlanPage" ? ShowMyPlanPage : HomePage
    };

    let lang = localStorage.getItem('lang');
    if(lang == null) {
      localStorage.setItem('lang', 'kr'); // default kr
      strings.setLanguage("kr");
    } else {
      strings.setLanguage(lang);
    }
  }

  loadPage(page) {
    this.hide();
    localStorage.setItem("pageToLoad", page);
    this.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
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
      height: '60px'
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
            <div style={{height: "100%"}}>
              <img src="img/islander.png" 
                className="center" 
                style={imageStyle} />
              <div style={divCenter} >
                <h3>Islander <Icon icon='plane' style={{color: '#00CED1'}}/> </h3>
                <h3>Jeju <img src="img/milgam.png" style={imageSmall} /></h3> 
              </div>
              <List>
                <ListItem onClick={this.loadPage.bind(this, "HomePage")} tappable 
                  style={listDiv}>
                  {this.state.strings.home}
                </ListItem>
                { this.state.strings.getLanguage() == 'kr' ? 
                (<ListItem onClick={this.loadPage.bind(this, "CourseRecommandationPage")} tappable 
                  style={listDiv}>
                  {this.state.strings.course}
                </ListItem>) : null}
                <ListItem onClick={this.loadPage.bind(this, "CreateFlightPlanPage")} tappable 
                  style={listDiv}>
                  {this.state.strings.createschedule}
                </ListItem>
                <ListItem onClick={this.loadPage.bind(this, "ShowMyPlanPage")} tappable 
                  style={listDiv}>
                  {this.state.strings.showschedule}
                </ListItem>
              </List>
            </div>
          </Page>
        </SplitterSide>
        <SplitterContent>
          <Navigator 
            initialRoute={{ 
              component: this.state.page, 
              props: { key: this.state.page.name, strings: this.state.strings } }} 
            renderPage={this.renderPage.bind(this)}
            ref={(navigator) => { this.navigator = navigator; }} />
        </SplitterContent>
      </Splitter>
    );
  }
}
