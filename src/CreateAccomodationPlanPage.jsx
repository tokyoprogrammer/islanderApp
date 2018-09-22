import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, Card, Modal} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import Stepper from 'react-stepper-horizontal';
import Calendar from 'react-calendar';

import './CalendarStyle';

import CreateVisitListPage from './CreateVisitListPage';
import GoogleSearchField from './GoogleSearchField';

export default class CreateAccomodationPlanPage extends React.Component {
  constructor(props) {
    super(props);
    let lang = localStorage.getItem("lang");
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let flightSchedule = JSON.parse(localStorage.getItem("flightScheduleInfo"));
    let arrivalDateTime = new Date(flightSchedule.arrivalTime);
    let departureDateTime = new Date(flightSchedule.departureTime);

    this.state = {
      arrivalDateTime: arrivalDateTime,
      departureDateTime: departureDateTime,
      strings: strings,
      nights: departureDateTime.getDate() - arrivalDateTime.getDate(),
      accomodationList: [],
      isOpen: false,
      currentAccomodation: {}
    };

    this.activeSteps = 1;
  }

  getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  showMenu() {
    this.props.showMenu();
  }

  changeLanguage() {
    let lang = this.state.strings.getLanguage();
    if(lang == 'kr') {
      this.state.strings.setLanguage('en');
      localStorage.setItem('lang', 'en');
    } else {
      this.state.strings.setLanguage('kr');
      localStorage.setItem('lang', 'kr');
    }
    this.setState({});
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

  goNext() {
    localStorage.setItem("accomodationInfo", JSON.stringify([
      {
        hotelInfo: {
          name: "Kal Hotel Jeju",
          addr: "...",
          lat: "...",
          lng: "..."
        },
        scheduleInfo: [
          "Sat Sep 22 2018 00:00:00 GMT+0900 (한국 표준시)",
          "Wed Sep 26 2018 00:00:00 GMT+0900 (한국 표준시)"
        ] 
      },
      {
        hotelInfo: {
          name: "Hyatt Regency Jeju",
          addr: "...",
          lat: "...",
          lng: "..."
        },
        scheduleInfo: [
          "Sat Sep 22 2018 00:00:00 GMT+0900 (한국 표준시)",
          "Wed Sep 26 2018 00:00:00 GMT+0900 (한국 표준시)"
        ] 
      }
    ]));

    this.props.navigator.pushPage({ 
      component: CreateVisitListPage 
    });
  }

  addToAccomodationList() {
    if(this.state.currentAccomodation.name != null && 
       this.state.currentAccomodation.lat != null && 
       this.state.currentAccomodation.lng != null) {
      let accomodationList = this.state.accomodationList;
      accomodationList.push(this.state.currentAccomodation);
      this.setState({accomodationList: accomodationList});
    } else {
      this.setState({});
    }
  }

  onSearchDone(places) {
    for(let i = 0; i < places.length; i++) {
      let place = places[i];
      this.setState({currentAccomodation: place});
    }
  }

  addToSchedule() {
    this.setState({isOpen: true});
  }

  renderAccomodationList(row, index) {
    return (
      <ListItem key={"al" + index}>
        <div className="left">
          {row.name}
        </div>
        <div className="center">
          yyyy.mm.dd - yyyy.mm.dd
        </div>
        <div className="right">
          <Button onClick={this.addToSchedule.bind(this)}>{this.state.strings.addtoschedule}</Button>
        </div>
      </ListItem>
    ); 
  }
  
  onCalendarChange(value) {
    console.log(value);
    this.setState({isOpen: false});
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

    const mapCenter = {
      lat: 33.356432,
      lng: 126.5268767
    };

    const mapZoom = 9;

    const closeIconSize = {
      default: 25,
      material: 23
    };

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
       renderModal={() => (
          <Modal
            isOpen={this.state.isOpen}>
            <div style={{width: "100%", display: "inline-block"}}>
              <div style={{width: "100%", textAlign: "center"}}>
                <Calendar activeStartDate={this.state.arrivalDateTime}
                  minDate={this.state.arrivalDateTime}
                  maxDate={this.state.departureDateTime}
                  selectRange={true}
                  returnValue="range"
                  onChange={this.onCalendarChange.bind(this)}
                  calendarType="US" className="calendar_width_100"
                  formatMonth={(value) => formatDate(value, 'MM')} />
              </div>
              <Button modifier='quiet' onClick={() => this.setState({isOpen: false})}
                style={{position: "absolute", top: "5%", right: "5%", color: "#D3D3D3"}} >
                <Icon icon="md-close-circle-o" size={closeIconSize} />
              </Button>
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
                {this.state.strings.hotelinfodesc}
              </p>
            </div>
          </Card>
          <b>{this.state.strings.yourplan}</b>
          <Card>
            <div>
              <p>
                {this.state.strings.flightarrival + " : " + this.state.arrivalDateTime}
              </p>
              <p>
                {this.state.strings.flightdeparting + " : " + this.state.departureDateTime}
              </p>
              <p>{this.state.nights + " 박"}</p>
            </div>
          </Card>
          <b>{this.state.strings.findaccomodation}</b>
          <GoogleSearchField initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
            width="100vw" height="30vh" onSearchDone={this.onSearchDone.bind(this)}/>
          <Button style={{width: "80%", margin: "10%", textAlign: "center"}} 
            onClick={this.addToAccomodationList.bind(this)}>
            {this.state.strings.addaccomodation}
          </Button>
          <List renderRow={this.renderAccomodationList.bind(this)} 
            dataSource={this.state.accomodationList} />
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
