import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, Card, Modal} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import App from './App';
import DetailView from './DetailView';
import FavoriteListView from './FavoriteListView';

import {ToolbarStyle} from './Styles';

export default class AllFavoritesPage extends React.Component {
  constructor(props) {
    super(props);
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if(favorites == null) {
      favorites = [];
      localStorage.setItem("favorites", JSON.stringify(favorites)); // change favorite list and save it.
      // make or read favorite list
    }

    let lang = localStorage.getItem("lang");
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    this.state = {
      strings: strings,
      showLoading: true,
      favorites: favorites
    };
  }

  componentDidUpdate(prevProps) {
    let favorites = localStorage.getItem('favorites');
    if(favorites != JSON.stringify(this.state.favorites)) {
      this.setState({favorites: JSON.parse(favorites)});
    } 
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
    return (
      <Toolbar>
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

  goDetails(contentId, contentTypeId) {
    localStorage.setItem("contentId", contentId);
    localStorage.setItem("contentTypeId", contentTypeId);
    this.props.navigator.pushPage({ 
      component: DetailView 
    });
  }

  favoriteListLoadDone() {
    this.setState({showLoading: false})
  }

  loadPage(page) {
    localStorage.setItem("pageToLoad", page);
    this.props.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
  }

  render() {
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
       renderModal={() => (
          <Modal
            isOpen={this.state.showLoading}>
            <div style={{width: "100%", display: "inline-block", position: "relative"}}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
        <div>
          <FavoriteListView onLoadDone={this.favoriteListLoadDone.bind(this)} 
            onMoreClicked={this.goDetails.bind(this)} showStar={true} />
        </div> 
        <div style={{textAlign: "center"}}>
          <Button style={{width: "80%", margin: "2%"}} onClick={this.loadPage.bind(this, "HomePage")}>
            {this.state.strings.moresights}
          </Button>
          {this.state.strings.getLanguage() == "kr" ? 
            (<Button style={{width: "80%", margin: "2%"}} 
              onClick={this.loadPage.bind(this, "CourseRecommandationPage")}>
              {this.state.strings.moreplans}
            </Button>) : null }
        </div>
      </Page>
    );
  }
}
