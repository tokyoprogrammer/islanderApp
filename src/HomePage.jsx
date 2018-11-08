import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem, Row, Col} from 'react-onsenui';

import MapView from './MapView';
import PixabayImage from './PixabayImage';
import WeatherPage from './WeatherPage';
import HomePlanCard from './HomePlanCard'; 
import App from './App';

import {DivH100Style, ToolbarStyle, HomeStyle} from './Styles';

import './HomePageCSS';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    localStorage.setItem("coursecontentid", 0);

    const serviceKey = process.env.REACT_APP_VISIT_KOREA_API_KEY;
    const fixedAreaCode = 39; /* jeju island area code */
    const fixedContentType = 25;
    const serviceLang = "KorService";

    const urlForCourseList = "https://api.visitkorea.or.kr/openapi/service/rest/" + 
      serviceLang + "/areaBasedList?ServiceKey=" + serviceKey + 
      "&contentTypeId=" + fixedContentType + "&areaCode=" + fixedAreaCode + 
      "&sigunguCode=&cat1=C01&cat2=&cat3=&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide" + 
      "&arrange=A&numOfRows=1000&pageNo=1";
    let category_recommandation = require("./category_recommandation.json");

    this.state = {
      weatherIcon: "",
      weatherDegree: "",
      urlForCourseList: urlForCourseList,
      courseList: [],
      recommandation: category_recommandation
    }
    this.readWeather();
    
    if(this.props.strings.getLanguage() == "kr") {
      let cache = JSON.parse(localStorage.getItem("homecourse"));
      let useCache = false;
      if(cache != null) {
        let cacheValidUntil = new Date(cache.createdDateTime);
        cacheValidUntil.setDate(cacheValidUntil.getDate() + 1); 
        // cache will be valid until + 1 day of the created day.
        let currentDateTime = new Date();
        if(currentDateTime <= cacheValidUntil) {
          // compare and if cache is fresh
          useCache = true;
        }
      }

      if(useCache) {
        var this_ = this;
        const sleepTime = 300;
        // lazy loading using Promise mechanism
        new Promise(function(resolve, reject) {
          setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
        }).then(function(result) {
          this_.setState({courseList: cache.items});
        });
      } else {
        this.readCourseList();
      }
    }
  }

  readCourseList() {
    var this_ = this;
    
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        this_.setState({courseList: ret});
        let cache = {
          createdDateTime: new Date(),
          items: ret
        };
        localStorage.setItem("homecourse", JSON.stringify(cache));

        resolve(ret[0]);
      }
      xhr.onerror = function() {
        notification.alert(this_.props.strings.oops);
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForCourseList);
      xhr.send(null);
    }).then(function(result) {
    });
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
    return items;
  }

  readWeather() {
    let cache = JSON.parse(localStorage.getItem("weather"));
    let useCache = false;
    if(cache != null) {
      let cacheValidUntil = new Date(cache.createdDateTime);
      cacheValidUntil.setHours(cacheValidUntil.getHours() + 1);
      // cache will be valid until + 1 hour of the created hour.
      let currentDateTime = new Date();
      if(currentDateTime <= cacheValidUntil) {
        useCache = true;
      }
    }

    if(useCache) {
      var this_ = this;
      const sleepTime = 500;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        let weather = cache.data;
        this_.setState({
          weatherIcon: weather.weatherIcon,
          weatherDegree: weather.weatherDegree,
        });
      });

      return; 
    }

    var this_ = this;
    let lang = this.props.strings.getLanguage();
    let URL = "https://api.openweathermap.org/data/2.5/weather?q=Jeju,kr" + 
      "&appid=" + process.env.REACT_APP_WEATHER_API_KEY + 
      "&lang=" + lang;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let res = JSON.parse(xhr.responseText);
        let weatherIcon = "img/weather/" + res.weather[0].icon + ".png";
        let weatherDegree = (res.main.temp - 273.15).toFixed(1);
        let tempMin = (res.main.temp_min - 273.15).toFixed(1);
        let tempMax = (res.main.temp_max - 273.15).toFixed(1);
        this_.setState({
          weatherIcon: weatherIcon,
          weatherDegree: weatherDegree,
          tempMin: tempMin,
          tempMax: tempMax
        });
        localStorage.setItem("weather", JSON.stringify({
          createdDateTime: new Date(),
          data: {
            weatherIcon: weatherIcon,
            weatherDegree: weatherDegree,
            tempMin: tempMin,
            tempMax: tempMax
          }
        }));
        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', URL);
      xhr.send(null);
    });
  }

  pushPage(code) {
    localStorage.setItem("code", code);
    this.props.navigator.pushPage({ 
      component: MapView 
    });
  }

  pushWeatherPage() {
    this.props.navigator.pushPage({ 
      component: WeatherPage 
    });
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

  bottomOnClick(pageToLoad) {
    localStorage.setItem("pageToLoad", pageToLoad);
    this.props.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
  }

  cardOnClick(contentId) {
    localStorage.setItem("coursecontentid", contentId);
    localStorage.setItem("pageToLoad", "CourseRecommandationPage");
    this.props.navigator.resetPage({ 
      component: App, 
      props: { key: App.name, strings: this.state.strings } }, 
      { animation: 'none' });
  }

  sightOnClick(categoryId) {
    console.log(categoryId);
  }

  foodOnClick(categoryId) {
    console.log(categoryId);
  }

  render() {
    const isKr = this.props.strings.getLanguage() == 'kr' ? true : false;
    
    let sightCode = isKr ? 12 : 76; 
    let cultureCode = isKr ? 14 : 78;
    let festivalCode = isKr ? 15 : 85;
    let activityCode = isKr ? 28 : 75;
    let shoppingCode = isKr ? 38 : 79;
    let foodsCode = isKr ? 39 : 82;

    const weatherStyles = HomeStyle.weather;
    const mainBtns = HomeStyle.mainbtns;
    const plans = HomeStyle.plan;
    const recommand = HomeStyle.recommand;
    const bottomBtns = HomeStyle.bottombtns;
    let recommandation = isKr ? this.state.recommandation.kr : this.state.recommandation.en;

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={DivH100Style}>
          <PixabayImage />
	  <Button modifier="quiet"
            style={weatherStyles.container.style} 
            onClick={this.pushWeatherPage.bind(this)}>
            <img src={this.state.weatherIcon} style={weatherStyles.icon.style} />
            <span style={weatherStyles.text.style}>
              {this.state.weatherDegree + weatherStyles.text.degree}
            </span>
          </Button>
          <div style={mainBtns.container.style}>
            <Row style={mainBtns.rows.first.style}>
              <Col width={mainBtns.cols.col1.width}>
                <div style={mainBtns.cols.col1.div.style}>
                  <Button style={mainBtns.cols.col1.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, sightCode)}>
                    <img src={mainBtns.icons.sightseeing} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.sight}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col2.width}>
                <div style={mainBtns.cols.col2.div.style}>
                  <Button style={mainBtns.cols.col2.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, foodsCode)}>
                    <img src={mainBtns.icons.food} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.foods}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col3.width}>
                <div style={mainBtns.cols.col3.div.style}>
                  <Button style={mainBtns.cols.col3.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, cultureCode)}>
                    <img src={mainBtns.icons.culture} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.art}</strong></p>
                </div>
              </Col>
            </Row>
            <Row style={mainBtns.rows.second.style}>
              <Col width={mainBtns.cols.col1.width}>
                <div style={mainBtns.cols.col1.div.style}>
                  <Button style={mainBtns.cols.col1.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, festivalCode)}>
                    <img src={mainBtns.icons.festival} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.festival}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col2.width}>
                <div style={mainBtns.cols.col2.div.style}>
                  <Button style={mainBtns.cols.col2.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, activityCode)}>
                    <img src={mainBtns.icons.activity} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.activity}</strong></p>
                </div>
              </Col>
              <Col width={mainBtns.cols.col3.width}>
                <div style={mainBtns.cols.col3.div.style}>
                  <Button style={mainBtns.cols.col3.btn.style} 
                    modifier="quiet"
                    onClick={this.pushPage.bind(this, shoppingCode)}>
                    <img src={mainBtns.icons.shopping} style={mainBtns.icons.style}/>
                  </Button>
                  <p style={mainBtns.cols.font.style}><strong>{this.props.strings.shopping}</strong></p>
                </div>
              </Col>
            </Row>
          </div>
          {this.props.strings.getLanguage() == "kr" ? (
          <div style={plans.container.style}>
            <p style={plans.text.style}><strong>{this.props.strings.courserecommend}</strong></p> 
            <div className="scrolling-wrapper">
              {this.state.courseList.map((item, index) => ( 
                <HomePlanCard key={"plancard-" + index} 
                  contentid={item.contentid._text} 
                  title={item.title._text} 
                  img={item.firstimage == null ? "img/noimage.png" : item.firstimage._text}
                  onClick={this.cardOnClick.bind(this)}/>
              ))}
            </div>
          </div>) : null }
          <div style={recommand.container.style}>
            <p style={recommand.text.style}><strong>{this.props.strings.sightrecommand}</strong></p>
            <div style={recommand.tagcontainer.style}>
              {recommandation.sights.map((item, index) => (
                <span key={"sight-recom-" + index} style={recommand.sighttag.style}
                  onClick={this.sightOnClick.bind(this, item.key)}>
                  {item.value}
                </span>
              ))}
            </div>
            <p style={recommand.text.style}><strong>{this.props.strings.foodrecommand}</strong></p>
            <div style={recommand.tagcontainer.style}>
              {recommandation.foods.map((item, index) => (
                <span key={"food-recom-" + index} style={recommand.foodtag.style}
                  onClick={this.foodOnClick.bind(this, item.key)}>
                  {item.value}
                </span>
              ))}
            </div>
          </div>
          <div style={bottomBtns.container.style}>
            <Button style={bottomBtns.btns.createbtn.style} 
              onClick={this.bottomOnClick.bind(this, "CreateFlightPlanPage")}>
              <p style={bottomBtns.btns.text.style}>
               {this.props.strings.createschedule}
              </p>
              <span style={bottomBtns.btns.chevron.style}></span>
            </Button>
            <Button style={bottomBtns.btns.showbtn.style} 
              onClick={this.bottomOnClick.bind(this, "ShowMyPlanPage")}>
              <p style={bottomBtns.btns.text.style}>
               {this.props.strings.showschedule}
              </p>
              <span style={bottomBtns.btns.chevron.style}></span>
            </Button>
          </div>
        </div>
      </Page>
    );
  }
}
