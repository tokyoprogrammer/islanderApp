import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, Card, Modal, Row, Col} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import Stepper from 'react-stepper-horizontal';
import Calendar from 'react-calendar';

import './CalendarStyle';

import CreateVisitListPage from './CreateVisitListPage';
import GoogleSearchField from './GoogleSearchField';

import {CenterDivStyle, ToolbarStyle, AccomodationPageStyle} from './Styles';

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
    hours = hours < 10 ? '0' + hours : hours;
    let minutes = datetime.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    dateInfo = year + this.state.strings.year + " "
               + month + this.state.strings.month + " "
               + date + this.state.strings.date + " "
               + day + " " + hours + ":" + minutes;
    return dateInfo;
  }

  convertDate(datetime){
    let dateInfo;
    let year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    let date = datetime.getDate();
    let day = datetime.getDay();
    dateInfo = year + this.state.strings.year + " "
               + month + this.state.strings.month + " "
               + date + this.state.strings.date + " ";
    return dateInfo;
  }

  validateOneDayTravel(){
    let arrivalDateTime = this.state.arrivalDateTime;
    let departureDateTime = this.state.departureDateTime;

    let arrivalYear = arrivalDateTime.getFullYear();
    let arrivalMonth = arrivalDateTime.getMonth() +1;
    let arrivalDate = arrivalDateTime.getDate();
    let departYear = departureDateTime.getFullYear();
    let departMonth = departureDateTime.getMonth() +1;
    let departDate = departureDateTime.getDate();
    if(arrivalYear == departYear &&
       arrivalMonth == departMonth &&
       arrivalDate == departDate) {
      return 1;
    }else{
      return 0;
    }
  }


  goNext() {
    let accomodationList = this.state.accomodationList;
    let arrivalDateTime = this.state.arrivalDateTime;
    let departureDateTime = this.state.departureDateTime;

    let travelTotalNight = this.getAccomodationDate(arrivalDateTime,departureDateTime);
    let tmp = [];
    let travelArray = [travelTotalNight];
    let accomodationSum = 0; 
    let travelObj = {};
    if(this.validateOneDayTravel()){
      /* don't require accomodation info */ 
      this.props.navigator.pushPage({ 
        component: CreateVisitListPage 
      });
    }

    let travelDateTmp = new Date(arrivalDateTime);
    travelDateTmp.setHours(0, 0, 0, 0);
    for(let i=0; i < travelTotalNight; i++){
      travelObj[travelDateTmp.toString()] = "0";
      travelArray[i] = travelObj[travelDateTmp.toString()];
      travelDateTmp.setDate(travelDateTmp.getDate() + 1);
    }
    /* save accomodation information */
    for (let i = 0; i < accomodationList.length; i++) {   
      let item = accomodationList[i];
      if(item.scheduleInfo[0] == null || item.scheduleInfo[1] == null){
        notification.alert(this.state.strings.emptyaccomodation);
        return;
      }
      tmp.push({
        hotelInfo: {
          name: item.name,
          addr: item.addr,
          lat: item.lat,
          lng: item.lng
        },
        scheduleInfo: [
          item.scheduleInfo[0].toString(),
          item.scheduleInfo[1].toString()
        ] 
      });
      
      let eachAccomodationDate = this.getAccomodationDate(item.scheduleInfo[0], item.scheduleInfo[1]);
      if(eachAccomodationDate < 1) {
        notification.alert(this.state.strings.zerodayaccomodation);
        return;
      }
      accomodationSum = accomodationSum + eachAccomodationDate;
      
      let startAccomodationDateFromFirstDate = this.getAccomodationDate(item.scheduleInfo[0], arrivalDateTime);
      let accomodationDateTmp = new Date(item.scheduleInfo[0]);
      for(let j = startAccomodationDateFromFirstDate; 
           j < startAccomodationDateFromFirstDate + eachAccomodationDate; j++){
        travelObj[accomodationDateTmp.toString()] = "1";
        travelArray[j] = travelObj[accomodationDateTmp.toString()];
        accomodationDateTmp.setDate(accomodationDateTmp.getDate() + 1);
      }
    }  

    /* condition 1 : aaccomodation sum is same with travel total night  */
    if(accomodationSum > travelTotalNight) {
      /* duplicated accomodation case */
      notification.alert(this.state.strings.duplicateaccomodation);
      return;
    }else if(accomodationSum < travelTotalNight) {
      /* lack of  accomodation case */
      notification.alert(this.state.strings.emptyaccomodation);
      return; 
    }

    for(let i = 0; i < travelTotalNight; i++) {
      if(travelArray[i] == "0") {
         notification.alert(this.state.strings.emptyaccomodation); 
         return; 
      }
    }

    localStorage.setItem("accomodationInfo", JSON.stringify(tmp));

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
    /* alert - one day travel case */
    if(this.validateOneDayTravel()){
      notification.alert(this.state.strings.onedaytravel);
      return;
    }
    /* alert - out of jeju hotel information */
    let addrInfo = this.state.currentAccomodation.addr;
    let retJeju = addrInfo.search(/jeju/i);
    let retSeogwipo = addrInfo.search(/seogwipo/i);
    if(retJeju == -1 && retSeogwipo == -1){
      notification.alert(this.state.strings.notjejuaccomodation);
      return;
    }

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
    this.setState({isOpen: true, selectedRow: row});
  }

  renderAccomodationList(row, index) {
    const listStyle = AccomodationPageStyle.list; 
    const calendarIconSize = listStyle.calendar.size;

    return (
      <ListItem key={"al" + index} modifier="longdivider">
        <Row style={listStyle.row.style}> 
          <Col width={listStyle.cols.col1.width} style={listStyle.cols.col1.style}>
            {row.name}
          </Col>
          <Col width={listStyle.cols.col2.width}>
            {row.scheduleInfo != null && row.scheduleInfo.length >= 2 ? 
              this.convertDate(row.scheduleInfo[0]) + " ~ " + 
              this.convertDate(row.scheduleInfo[1]) :
              this.state.strings.accomodationDateDefault}
          </Col>
          <Col width={listStyle.cols.col3.width}>
            <div>
            <Button onClick={this.addToSchedule.bind(this, row)} modifier='quiet'
              style={listStyle.calendar.style}>
              <Icon icon={listStyle.calendar.icon} size={calendarIconSize} />
            </Button>
            <Button onClick={this.deleteSchedule.bind(this,row)} modifier='quiet' 
              style={listStyle.deleteIcon.style}>
              <Icon icon={listStyle.deleteIcon.icon} size={calendarIconSize} />
            </Button>
            </div>
          </Col>
        </Row>
      </ListItem>
    ); 
  }
  
  deleteSchedule(row){
    let accomodationList = this.state.accomodationList; 
    for(let i = 0; i < accomodationList.length; i++) {
      let item = accomodationList[i];
      if(row == item) {
        accomodationList.splice(i,1);
      }
    }
    this.setState({});
  }

  onCalendarChange(value) {
    let accomodationListCopy = this.state.accomodationList;
    for(let i = 0; i < accomodationListCopy.length; i++) {
      let item = accomodationListCopy[i];
      if(this.state.selectedRow == item) {
        item.scheduleInfo = value.slice(0);
      }
    }
    
    this.setState({isOpen: false, accomodationList: accomodationListCopy});
  }

  getAccomodationDate(startDate, endDate){
    let start = new Date(startDate);
    let end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    let diff = Math.abs(start - end);
    let accomodationDate = parseInt(Math.floor(diff/(1000 * 60 * 60 * 24)));

    return accomodationDate;
  }

  render() {
    const infoMarkIconSize = AccomodationPageStyle.info.size;

    const steps = [
      {title: this.state.strings.flightinfo},
      {title: this.state.strings.hotelinfo},
      {title: this.state.strings.favoritesinfo},
      {title: this.state.strings.createdone}
    ];

    const mapCenter = AccomodationPageStyle.map.center;
    const mapZoom = AccomodationPageStyle.map.zoom;

    const modalStyle = AccomodationPageStyle.modal;
    const closeIconSize = modalStyle.close.size;
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
       renderModal={() => (
          <Modal
            isOpen={this.state.isOpen}>
            <div style={modalStyle.style}>
              <div style={modalStyle.calendar.style}>
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
                style={modalStyle.close.style} >
                <Icon icon={modalStyle.close.icon} size={closeIconSize} />
              </Button>
            </div>
          </Modal>
        )}>
 
        <div>
          <div style={CenterDivStyle}>
            <h2>{this.state.strings.createschedule}</h2>
          </div>
          <div style={AccomodationPageStyle.steps.style}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Card>
            <div>
              <p>
                <Icon icon={AccomodationPageStyle.info.icon} 
                  size={infoMarkIconSize} style={AccomodationPageStyle.info.style} /> 
                {this.state.strings.hotelinfodesc}
              </p>
            </div>
          </Card>
          <b style={AccomodationPageStyle.text.style}>{this.state.strings.yourplan}</b>
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
              <p>
                 {this.getAccomodationDate(this.state.arrivalDateTime, this.state.departureDateTime) + 
                  this.state.strings.nights + " "}
                 {this.getAccomodationDate(this.state.arrivalDateTime, this.state.departureDateTime)+ 1 }
                 {this.state.strings.days}
              </p>
            </div>
          </Card>
          <b style={AccomodationPageStyle.text.style}>{this.state.strings.findaccomodation}</b>
          <GoogleSearchField initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
            height={AccomodationPageStyle.map.height} onSearchDone={this.onSearchDone.bind(this)}/>
          <Button style={AccomodationPageStyle.addBtn.style} 
            onClick={this.addToAccomodationList.bind(this)}>
            {this.state.strings.addaccomodation}
          </Button>
          <List renderRow={this.renderAccomodationList.bind(this)} 
            dataSource={this.state.accomodationList} />
          <div style={AccomodationPageStyle.steps.style}>
            <Stepper steps={steps} activeStep={this.activeSteps} />
          </div>
          <Button style={AccomodationPageStyle.gonext.style} 
            onClick={this.goNext.bind(this)}>
            {this.state.strings.gonext}
          </Button>          
        </div>
      </Page>
    );
  }
}
