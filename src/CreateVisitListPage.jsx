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
      checkedSights: []
    };

    localStorage.setItem("checkedSights", JSON.stringify([]));
    this.activeSteps = 2;
  }

  showMenu() {
    this.props.showMenu();
  }

  renderToolbar() {
    const imgStyle = {
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

  loadPage(page) {
    localStorage.setItem("pageToLoad", page);
    this.props.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
  }

  goNext() {
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
    const centerDiv = {textAlign: "center"};
    const infoMarkIconSize = {
      default: 30,
      material: 28
    };

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
            <div style={{width: "100%", display: "inline-block", position: "relative"}}>
              <h3>Loading...</h3>
              <ProgressCircular indeterminate />
            </div>
          </Modal>
        )}>
 
        <div>
          <div style={centerDiv}>
            <h2>{this.state.strings.createschedule}</h2>
          </div>
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Card>
            <div>
              <p>
                <Icon icon='md-info' size={infoMarkIconSize} style={{marginRight: "10px"}} /> 
                {this.state.strings.favoritesinfodesc}
              </p>
            </div>
          </Card>
          <FavoriteListView onLoadDone={this.favoriteListLoadDone.bind(this)} 
            onMoreClicked={this.goDetails.bind(this)} onCheckChanged={this.onCheckChanged.bind(this)} />
          <div style={{textAlign: "center"}}>
            <Button style={{width: "80%", margin: "2%"}} onClick={this.loadPage.bind(this, "HomePage")}>
              {this.state.strings.moresights}
            </Button>
            {this.state.strings.getLanguage() == "kr" ?
              (<Button style={{width: "80%", margin: "2%"}} 
                onClick={this.loadPage.bind(this, "CourseRecommandationPage")}>
                {this.state.strings.moreplans}
              </Button>) : 
              null
            }
          </div>
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={{width: "80%", margin: "10%", textAlign: "center"}} onClick={this.goNext.bind(this)}>
            {this.state.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
