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
    let hotelInfo = null;

    this.state = {
      arrivalDateTime: arrivalDateTime,
      departureDateTime: departureDateTime,
      strings: strings,
      nights: departureDateTime.getDate() - arrivalDateTime.getDate(),
      accomodationList: [],
      isOpen: false,
      selectedRow: {},
      currentAccomodation: {},
      hotelInfo : hotelInfo
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

  
  convertTime(datetime){
    let dateInfo;
    let year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    let date = datetime.getDate();
    let day =  datetime.getDay();
    switch(day){
      case 0 : day = this.state.strings.sunday; 
               break; 
      case 1 : day = this.state.strings.monday;
               break;
      case 2 : day = this.state.strings.tuesday;
               break;
      case 3 : day = this.state.strings.wednesday;
               break;
      case 4 : day = this.state.strings.thursday;
               break;
      case 5 : day = this.state.strings.friday;
               break;
      case 6 : day = this.state.strings.saturday;
               break;
      default : console.log("wrong day information");
               break;
    }
    let hours = datetime.getHours();
    hours = hours < 10 ? '0'+hours : hours;
    let minutes = datetime.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    
    dateInfo = year+this.state.strings.year+" "
               +month+this.state.strings.month+" "
               +date+this.state.strings.date+" "
               +day+" "+hours+ ":"+minutes;
    return dateInfo;
  }

  convertDate(datetime){
    let dateInfo;
    let year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    let date = datetime.getDate();
    let day =  datetime.getDay();
    dateInfo = year+this.state.strings.year+" "
               +month+this.state.strings.month+" "
               +date+this.state.strings.date+" ";
    return dateInfo;
  }

  goNext(arrivalDateTime,departureDateTime) {
    localStorage.setItem("test",JSON.stringify([
      {
        hotelInfo:  {
          name : " name1",
          addr : "addr1",
          lat: 33.50566000000001,
          lng: 126.52616999999998
        },
        scheduleInfo:  [
          arrivalDateTime.toString(),
          departureDateTime.toString()
        ]
      }
    ]));
  
    localStorage.setItem("accomodationInfo", JSON.stringify([
      {
        hotelInfo: {
          name: "Kal Hotel Jeju",
          addr: "South Korea, Jeju-do, Cheju, Ido 1(il)-dong, 중앙로 151",
          lat: 33.50566000000001,
          lng: 126.52616999999998
        },
        scheduleInfo: [
          "Sat Sep 22 2018 00:00:00 GMT+0900 (한국 표준시)",
          "Wed Sep 24 2018 00:00:00 GMT+0900 (한국 표준시)"
        ] 
      },
      {
        hotelInfo: {
          name: "Hyatt Regency Jeju",
          addr: "114, Jungmungwangwang-ro 72 beon-gil, "
               + "색달동 Seogwipo-si, Jeju-do, South Korea",
          lat: 33.244488,
          lng: 126.40593799999999
        },
        scheduleInfo: [
          "Sat Sep 24 2018 00:00:00 GMT+0900 (한국 표준시)",
          "Wed Sep 26 2018 00:00:00 GMT+0900 (한국 표준시)"
        ] 
      }
    ]));

    this.props.navigator.pushPage({ 
      component: CreateVisitListPage 
    });
  }

  copy(mainObj) {
    let objCopy = {}; // objCopy will store a copy of the mainObj
    let key;
    for (key in mainObj) {
      objCopy[key] = mainObj[key]; // copies each property to the objCopy object
    }
    return objCopy;
  }

  addToAccomodationList() {
    if(this.state.currentAccomodation.name != null && 
       this.state.currentAccomodation.lat != null && 
       this.state.currentAccomodation.lng != null) {
      let accomodationList = this.state.accomodationList;
      let accomodationToAdd = this.copy(this.state.currentAccomodation);
      accomodationToAdd.key = accomodationList.length + 1;
      accomodationList.push(accomodationToAdd);
      this.setState({accomodationList: accomodationList});
    } else {
      this.setState({});
    }
  }

  onSearchDone(places) {
    for(let i = 0; i < places.length; i++) {
      let place = places[i];
      place.scheduleInfo = [];
      this.setState({currentAccomodation: place});
    }
  }

  addToSchedule(row) {
    console.log(row);
    this.setState({isOpen: true, selectedRow: row});
  }

  renderAccomodationList(row, index) {
    const calendarIconSize = {
      default: 25,
      material: 23
    };

    return (
      <ListItem key={"al" + index}>
        <div className="left">
          {row.name}
        </div>
        <div className="center">
          {row.scheduleInfo != null && row.scheduleInfo.length >= 2 ? 
            this.convertDate(row.scheduleInfo[0]) + " ~ " + 
            this.convertDate(row.scheduleInfo[1]) :
            this.state.strings.accomodationDateDefault}
        </div>
        <div className="right">
          <Button onClick={this.addToSchedule.bind(this, row)} modifier='quiet' >
            <Icon icon="md-calendar" size={calendarIconSize} />
          </Button>
          <Button modifier='quiet' style={{color: 'black'}} >
            <Icon icon='md-delete' size={calendarIconSize} />
          </Button>
        </div>
      </ListItem>
    ); 
  }
  
  onCalendarChange(value) {
    console.log(value);
    let accomodationListCopy = this.state.accomodationList;

    for(let i = 0; i < accomodationListCopy.length; i++) {
      let item = accomodationListCopy[i];
      if(this.state.selectedRow == item) {
        console.log(item);
        item.scheduleInfo = value.slice(0);
      }
    }
    
    this.setState({isOpen: false, accomodationList: accomodationListCopy});
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
                  onActiveDateChange={this.onCalendarChange.bind(this)}
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
                {this.state.strings.flightarrival + " : "
                +this.convertTime(this.state.arrivalDateTime)} 
              </p> 
              <p>
                {this.state.strings.flightdeparting + " : " 
                +this.convertTime(this.state.departureDateTime)}
              </p>
              <p>{this.state.nights + this.state.strings.nights+" "}
                {this.state.nights+1}{this.state.strings.days}
              </p>
            </div>
          </Card>
          <b>{this.state.strings.findaccomodation}</b>
          <GoogleSearchField initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
            height="30vh" onSearchDone={this.onSearchDone.bind(this)}/>
          <Button style={{width: "80%", margin: "10%", 
            marginTop: "1%", marginBottom: "2%", textAlign: "center"}} 
            onClick={this.addToAccomodationList.bind(this)}>
            {this.state.strings.addaccomodation}
          </Button>
          <List renderRow={this.renderAccomodationList.bind(this)} 
            dataSource={this.state.accomodationList} />
          <div style={{padding: "1%"}}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={{width: "80%", margin: "10%", textAlign: "center", backgroundColor: "#FF8C00"}} 
            onClick={this.goNext.bind(this,this.state.arrivalDateTime,this.state.departureDateTime)}>
            {this.state.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
