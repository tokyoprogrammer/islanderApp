import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem} from 'react-onsenui';

import PlanView from './PlanView';
import App from './App';

import {ToolbarStyle} from './Styles';

export default class ShowMyPlan extends React.Component {
  constructor(props) {
    super(props);
    let plan = JSON.parse(localStorage.getItem("plan" + this.props.strings.getLanguage()));
    if(plan != null) plan = plan.data;
    this.state = {
      plan: plan
    };
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
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'>
        <img src={ToolbarStyle.btns.lang.imgs.eng} 
          style={ToolbarStyle.btns.lang.imgs.style}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'>
        <img src={ToolbarStyle.btns.lang.imgs.kor}
          style={ToolbarStyle.btns.lang.imgs.style}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
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

  render() {
    const centerDiv = {textAlign: "center"};
    
    let planView = this.state.plan != null && this.state.plan.length > 0 ? (<PlanView 
      navigator={this.props.navigator}/>) : 
      (<div style={{textAlign: "center"}}>
        <h3 style={{margin: "5%"}}>{this.props.strings.thereisnoplan}</h3>
        <Button style={{width: "80%"}} onClick={this.loadPage.bind(this, "CreateFlightPlanPage")}>
          {this.props.strings.createschedule}
        </Button>
      </div>);
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={centerDiv}>
          <h2>{this.props.strings.showschedule}</h2>
        </div>
        {planView}
      </Page>
    );
  }
}
