import React from 'react';
import ReactDOM from 'react-dom';
import {Navigator, Splitter, SplitterSide, SplitterContent, Page, Button, List, ListItem, Icon} from 'react-onsenui';
import LocalizedStrings from 'react-localization';

import HomePage from './HomePage';
import CourseRecommandationPage from './CourseRecommandationPage';
import CreateFlightPlanPage from './CreateFlightPlanPage';
import ShowMyPlanPage from './ShowMyPlanPage';
import AllFavoritesPage from './AllFavoritesPage';

import {DivH100Style, CenterDivStyle, MenuStyle} from './Styles';

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
        pageName == "AllFavoritesPage" ? AllFavoritesPage :
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
    return (
      <Splitter>
        <SplitterSide
          side='right'
          collapse={true}
          isOpen={this.state.isOpen}
          onClose={this.hide.bind(this)}
          swipeable={false}>
          <Page>
            <div style={DivH100Style}>
              <img src={MenuStyle.logo.circleImg.url} 
                className="center" 
                style={MenuStyle.logo.circleImg.style} />
              <div style={CenterDivStyle} >
                <img src={MenuStyle.logo.img.url} style={MenuStyle.logo.img.style} />
                <style dangerouslySetInnerHTML={
                  { __html: MenuStyle.logo.text.psuedoContent.join('\n')}}>
                </style>
                <p className={MenuStyle.logo.text.className} 
                  style={MenuStyle.logo.text.style}>
                  <span style={MenuStyle.logo.text.spanStyle}>
                    {MenuStyle.logo.text.text}
                  </span>
                </p> 
              </div>
              <List>
                <ListItem onClick={this.loadPage.bind(this, "HomePage")} tappable 
                  style={MenuStyle.list.container.style}>
                  {this.state.strings.home}
                </ListItem>
                <ListItem onClick={this.loadPage.bind(this, "AllFavoritesPage")} tappable 
                  style={MenuStyle.list.container.style}>
                  {this.state.strings.favorite}
                </ListItem>
                { this.state.strings.getLanguage() == 'kr' ? 
                (<ListItem onClick={this.loadPage.bind(this, "CourseRecommandationPage")} tappable 
                  style={MenuStyle.list.container.style}>
                  {this.state.strings.course}
                </ListItem>) : null}
                <ListItem onClick={this.loadPage.bind(this, "CreateFlightPlanPage")} tappable 
                  style={MenuStyle.list.container.style}>
                  {this.state.strings.createschedule}
                </ListItem>
                <ListItem onClick={this.loadPage.bind(this, "ShowMyPlanPage")} tappable 
                  style={MenuStyle.list.container.style}>
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
            swipeable 
            renderPage={this.renderPage.bind(this)}
            ref={(navigator) => { this.navigator = navigator; }} />
        </SplitterContent>
      </Splitter>
    );
  }
}
