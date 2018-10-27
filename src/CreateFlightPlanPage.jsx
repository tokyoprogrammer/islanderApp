import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem, Card, Input} from 'react-onsenui';
import {notification} from 'onsenui';

import Stepper from 'react-stepper-horizontal';
import Calendar from 'react-calendar';

import './CalendarStyle';

import CreateAccomodationPlanPage from './CreateAccomodationPlanPage';
import {ToolbarStyle} from './Styles';

export default class CreateFlightPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrivalDate: new Date(),
      arrivalTime: '00:00',
      departureDate: new Date(),
      departureTime: '00:00'
    };
    this.activeSteps = 0;
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

  handleArrivalTimeChange(event) {
    this.setState({
      arrivalTime: event.target.value
    });
  }

  handleArrivalDateChange(date) {
    this.setState({
      arrivalDate: date
    });
  }

  handleDepartureTimeChange(event) {
    this.setState({
      departureTime: event.target.value
    });
  }

  handleDepartureDateChange(date) {
    this.setState({
      departureDate: date
    });
  }

  goNext() {
    if(this.state.arrivalTime == null || this.state.arrivalTime.length < 1 ||
       this.state.departureTime == null || this.state.departureTime.length < 1) {
      notification.alert(this.props.strings.cannotempty);
      return;
    }
    let arrivalTime = this.state.arrivalTime.split(":");
    let arrivalDateTime = this.state.arrivalDate;
    arrivalDateTime.setHours(arrivalTime[0], arrivalTime[1], 0);
    
    let departureTime = this.state.departureTime.split(":");
    let departureDateTime = this.state.departureDate;
    departureDateTime.setHours(departureTime[0], departureTime[1], 0);

    if(arrivalDateTime >= departureDateTime) {
      notification.alert(this.props.strings.cannotsame);
      return;
    }
    localStorage.setItem("flightScheduleInfo", JSON.stringify({
      arrivalTime: arrivalDateTime.toString(),
      departureTime: departureDateTime.toString()
    }));
    this.props.navigator.pushPage({ 
      component: CreateAccomodationPlanPage 
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
            <img src="img/arrival.png" style={{width: "30px", padding: "3px"}} />
            {this.props.strings.flightarrival}
          </h3>
          <div style={{width: "100%", textAlign: "center"}}>
            <Calendar value={this.state.arrivalDate} calendarType="US" className="calendar_width_100"
              onChange={this.handleArrivalDateChange.bind(this)} minDate={new Date()}/>
          </div>
          <section>
            <img src="img/clock.png" style={{width: "25px", padding: "3px", margin:"2%"}} />
            <b>{this.props.strings.arrivaltime} :</b>
            <Input type="time" modifier='material'
              value={this.state.arrivalTime} style={{width: "40%", height: "30px"}} 
              onChange={this.handleArrivalTimeChange.bind(this)} />
          </section>
          <h3>
            <img src="img/departure.png" style={{width: "30px", padding: "3px"}} />
            {this.props.strings.flightdeparting}
          </h3>
          <div style={{width: "100%", textAlign: "center"}}>
            <Calendar value={this.state.departureDate} calendarType="US" className="calendar_width_100"
              onChange={this.handleDepartureDateChange.bind(this)}
              minDate={this.state.arrivalDate} />
          </div>
          <section>
            <img src="img/clock.png" style={{width: "25px", padding: "3px", margin:"2%"}} />
            <b>{this.props.strings.departuretime} :</b>
            <Input type="time" modifier='material'
              value={this.state.departureTime} style={{width: "40%", height: "30px"}} 
              onChange={this.handleDepartureTimeChange.bind(this)} />
          </section>
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={{width: "80%", margin: "10%", textAlign: "center", backgroundColor: "#FF8C00"}} 
            onClick={this.goNext.bind(this)}>
            {this.props.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
