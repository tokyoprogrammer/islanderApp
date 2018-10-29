import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, Card, ProgressCircular, Modal} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import Stepper from 'react-stepper-horizontal';

import FavoriteListView from './FavoriteListView';
import App from './App';
import DetailView from './DetailView';
import CreatePlanPage from './CreatePlanPage';
import {CenterDivStyle, ToolbarStyle, VisitListPageStyle} from './Styles';

export default class CreateVisitListPage extends React.Component {
  constructor(props) {
    super(props);
    let lang = localStorage.getItem("lang");
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    this.state = {
      strings: strings,
      showLoading: true,
      checkedSights: [],
    };

    localStorage.setItem("checkedSights", JSON.stringify([]));
    this.activeSteps = 2;
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

  loadPage(page) {
    localStorage.setItem("pageToLoad", page);
    this.props.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
  }

  goNext() {
    if(this.state.checkedSights.length <= 0) {
      notification.alert(this.state.strings.cannotlessthanone);
      return;
    }

    localStorage.setItem("checkedSights", JSON.stringify(this.state.checkedSights));
    this.props.navigator.pushPage({ 
      component: CreatePlanPage
    });
  }

  favoriteListLoadDone() {
    this.setState({showLoading: false})
  }

  goDetails(contentId, contentTypeId) {
    localStorage.setItem("contentId", contentId);
    localStorage.setItem("contentTypeId", contentTypeId);
    this.props.navigator.pushPage({ 
      component: DetailView 
    });
  }

  onCheckChanged(check, id) {
    let checkedSights = this.state.checkedSights.slice(0); // copy array
    if(check) {
      checkedSights.push(id);
    } else {
      let index = checkedSights.indexOf(id);
      if(index > -1) {
        checkedSights.splice(index, 1);
      }
    }
    this.setState({checkedSights: checkedSights});
  }
  
  render() {
    const steps = [
      {title: this.state.strings.flightinfo},
      {title: this.state.strings.hotelinfo},
      {title: this.state.strings.favoritesinfo},
      {title: this.state.strings.createdone}
    ];

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
       renderModal={() => (
          <Modal
            isOpen={this.state.showLoading}>
            <div style={VisitListPageStyle.modal.style}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
 
        <div>
          <div style={CenterDivStyle}>
            <h2>{this.state.strings.createschedule}</h2>
          </div>
          <div style={VisitListPageStyle.step.style}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Card>
            <div>
              <p>
                <Icon icon={VisitListPageStyle.info.icon} 
                  size={VisitListPageStyle.info.size} 
                  style={VisitListPageStyle.info.style} /> 
                {this.state.strings.favoritesinfodesc}
              </p>
            </div>
          </Card>
          <FavoriteListView onLoadDone={this.favoriteListLoadDone.bind(this)} 
            onMoreClicked={this.goDetails.bind(this)} onCheckChanged={this.onCheckChanged.bind(this)} />
          <div style={CenterDivStyle}>
            <Button style={VisitListPageStyle.btns.style} onClick={this.loadPage.bind(this, "HomePage")}>
              {this.state.strings.moresights}
            </Button>
            {this.state.strings.getLanguage() == "kr" ?
              (<Button style={VisitListPageStyle.btns.style} 
                onClick={this.loadPage.bind(this, "CourseRecommandationPage")}>
                {this.state.strings.moreplans}
              </Button>) : 
              null
            }
          </div>
          <div style={VisitListPageStyle.step.style}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={VisitListPageStyle.gonext.style} 
            onClick={this.goNext.bind(this)}>
            {this.state.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
