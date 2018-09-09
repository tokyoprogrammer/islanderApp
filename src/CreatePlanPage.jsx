import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem, Card} from 'react-onsenui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Stepper from 'react-stepper-horizontal';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default class CreateMyPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrivalDate: moment(),
      arrivalTime: '00:00',
      departureDate: moment(),
      departureTime: '00:00'
    };
    this.activeStep = 0;
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
    const imgStyle = {
      height: '15px',
      marginTop: '5%'
    };
    
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/english.png" 
         style={{width: "33px"}}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/korean.png" 
         style={{width: "33px"}}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
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

  handleArrivalTimeChange(event) {
    console.log(event.target.value);
    this.setState({
      arrivalTime: event.target.value
    });
  }

  handleArrivalDateChange(date) {
    console.log(date);
    this.setState({
      arrivalDate: date
    });
  }

  handleDepartureTimeChange(event) {
    console.log(event.target.value);
    this.setState({
      departureTime: event.target.value
    });
  }

  handleDepartureDateChange(date) {
    console.log(date);
    this.setState({
      departureDate: date
    });
  }

  render() {
    const centerDiv = {textAlign: "center"};
    const infoMarkIconSize = {
      default: 30,
      material: 28
    };

    const steps = [
      {title: this.props.strings.flightinfo},
      {title: this.props.strings.hotelinfo},
      {title: this.props.strings.favoritesinfo},
      {title: this.props.strings.createdone}
    ];

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div>
          <div style={centerDiv}>
            <h2>{this.props.strings.createschedule}</h2>
          </div>
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Card>
            <div>
              <p>
                <Icon icon='md-info' size={infoMarkIconSize} style={{marginRight: "10px"}} /> 
                {this.props.strings.flightinfodesc}
              </p>
            </div>
          </Card>
          <h3>
            {this.props.strings.flightarrival}
            <img src="img/arrival.png" style={{width: "30px", padding: "3px"}} />
          </h3>
          <div style={{width: "100%", textAlign: "center"}}>
            <DatePicker selected={this.state.arrivalDate} 
              onChange={this.handleArrivalDateChange.bind(this)} inline />
            <br/>
            <input type="time" value={this.state.arrivalTime} style = {{width: "40%", height: "30px"}} 
              onChange={this.handleArrivalTimeChange.bind(this)} />
          </div>
          <h3>
            {this.props.strings.flightdeparting}
            <img src="img/departure.png" style={{width: "30px", padding: "3px"}} />
          </h3>
          <div style={{width: "100%", textAlign: "center"}}>
            <DatePicker selected={this.state.departureDate} 
              onChange={this.handleDepartureDateChange.bind(this)} inline />
            <br/>
            <input type="time" value={this.state.departureTime} style = {{width: "40%", height: "30px"}} 
              onChange={this.handleDepartureTimeChange.bind(this)} />
          </div>
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={{width: "80%", margin: "10%", textAlign: "center"}}>
            {this.props.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
