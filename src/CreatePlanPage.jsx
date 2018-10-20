import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, BackButton, Button, List, ListItem, Card, ProgressCircular, Modal} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import Stepper from 'react-stepper-horizontal';

import PlanView from './PlanView';

export default class CreatePlanPage extends React.Component {
  constructor(props) {
    super(props);
    let lang = localStorage.getItem("lang");
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let days = 0;
    let schedule = JSON.parse(localStorage.getItem("flightScheduleInfo"));
    let arrivalTime = new Date(schedule.arrivalTime);
    let departureTime = new Date(schedule.departureTime);
    days = departureTime.getDate() - arrivalTime.getDate() + 1;

    let accomodationInfo = JSON.parse(localStorage.getItem("accomodationInfo"));
    let accomodationArr = [];
    for(let i = 0; i < days - 1; i++) {
      let day = new Date(schedule.arrivalTime);
      day.setDate(day.getDate() + i);
      for(let j = 0; j < accomodationInfo.length; j++) {
        let accomodation = accomodationInfo[j];
        let start = new Date(accomodation.scheduleInfo[0]);
        start.setHours(0, 0, 0);
        let end = new Date(accomodation.scheduleInfo[1]);
        end.setHours(0, 0, 0);
        // 0: start day, 1: end day
        if(day >= start && day < end) {
          console.log(start);
          console.log(end);
          accomodationArr.push(accomodation.hotelInfo);
          break;
        }
      }
    }
    console.log(accomodationArr);

    this.state = {
      strings: strings,
      showLoading: true,
      checkedSights: JSON.parse(localStorage.getItem("checkedSights")),
      allSights: JSON.parse(localStorage.getItem("itemsAllSights" + lang)).items,
      visitList: [],
      days: days,
      schedule: schedule,
      accomodationInfo: accomodationInfo,
      accomodationArr: accomodationArr,
      plan: [],
      compare: require('compare-lat-lon')
    };

    this.activeSteps = 3;
    this.startPoint = {
      name: this.state.strings.jejuairport,
      addr: this.state.strings.jejuairportaddr,
      dfrom: 0,
      lat: "33.510440",
      lng: "126.491353"
    };
    this.makePlan();
  }

  showMenu() {
    this.props.showMenu();
  }

  makePlan() {
    var this_ = this;
    const sleepTime = 500;
    new Promise(function(resolve, reject) {
      setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
    }).then(function(result) {
      let visitList = this_.makeVisitList();

      let startPoint = this_.startPoint;
      visitList = this_.insertMatrix(startPoint, visitList); // calculate distance from airport
      // sort list based on dfrom factor.
      visitList.sort(function(a, b) {
        return a.dfrom - b.dfrom;
      });

      let visitLists = this_.chunkify(visitList, this_.state.days, true); 
      // chunkify entire plan into smaller N balanced arrays (N : days)
      let start = this_.startPoint;
      let end = this_.state.accomodationArr[0];
      for(let i = 0; i < visitLists.length; i++) {
        visitLists[i].unshift(start);
        visitLists[i].push(end);
        start = end;
        if(i + 1 < this_.state.days - 1) end = this_.state.accomodationArr[i + 1];
        else end = this_.startPoint;
      }
      localStorage.setItem("plan" + this_.state.strings.getLanguage(), JSON.stringify(
        {
          schedule: this_.state.schedule,
          accomodationInfo: this_.state.accomodationInfo,
          data: visitLists
        }));

      this_.setState({
        visitList: visitList,
        plan: visitLists,
        showLoading: false
      });
    });
  }

  makeVisitList() {
    let visitList = [];
    
    for(let i = 0; i < this.state.allSights.length; i++) {
      let sight = this.state.allSights[i];
      for(let j = 0; j < this.state.checkedSights.length; j++) {
        let checked = this.state.checkedSights[j];
        if(checked == sight.contentid._text) {
          let visit = {
            name: sight.title._text,
            contentid: checked,
            contenttypeid: sight.contenttypeid._text,
            addr: sight.addr1._text,
            lat: sight.mapy._text,
            lng: sight.mapx._text,
            dfrom: 0,
            image: sight.firstimage != null ? sight.firstimage._text : "img/bkground/default.jpg"
          };
          visitList.push(visit);
          break;
        }
      }
    }
    return visitList;
  }

  insertMatrix(startPoint, visitList) {
    let ret = visitList;

    for(let i = 0; i < ret.length; i++) {
      let point = {
        lat: ret[i].lat,
        lng: ret[i].lng
      };
 
      let weight = this.state.compare(
        this.startPoint.lat, this.startPoint.lng, 
        point.lat, point.lng);
      ret[i].dfrom = weight
    }
    return ret;
  }

  chunkify(a, n, balanced) {  
    if(n < 2) return [a];

    let len = a.length;
    let out = [];
    let i = 0;
    let size = 0;

    if (len % n === 0) {
      size = Math.floor(len / n);
      while (i < len) {
        out.push(a.slice(i, i += size));
      }
    } else if (balanced) {
      while (i < len) {
        size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
      }
    } else {
      n--;
      size = Math.floor(len / n);
      if (len % size === 0)
        size--;
      while (i < size * n) {
        out.push(a.slice(i, i += size));
      }
      out.push(a.slice(size * n));
    }

    return out;
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


  render() {
    const steps = [
      {title: this.state.strings.flightinfo},
      {title: this.state.strings.hotelinfo},
      {title: this.state.strings.favoritesinfo},
      {title: this.state.strings.createdone}
    ];

    const centerDiv = {textAlign: "center"};
    const infoMarkIconSize = {
      default: 30,
      material: 28
    };

    let planView = this.state.plan != null && this.state.plan.length > 0 ? (<PlanView 
      navigator={this.props.navigator}/>) : null;
    
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
              {this.state.strings.createdonedesc}
            </p>
          </div>
        </Card>
        {planView}
      </Page>
    );
  }
}
