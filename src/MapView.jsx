import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem} from 'react-onsenui';

import MapContainer from './MapContainer'

export default class MapView extends React.Component {
  constructor(props) {
    super(props);

    
    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    this.state = {
      urlForContentBase: "http://api.visitkorea.or.kr/openapi/service/rest/" + 
        "KorService/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=", 
      urlForContentRemain: "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC" + 
        "&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=1000&pageNo=1",
      segmentIndex: 0,
      items: [],
      availCategories: [],
      filterCarouselIndex: 0,
      filterButtons: [],
      filterCarouselItems: null
    };
    
    this.readLists(this.props.code);
  }

  showMenu() {
    this.props.showMenu();
  }

  readLists(code) {
    var this_ = this;
    console.log(this.state.urlForContentBase + code + this.state.urlForContentRemain);
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        var XMLParser = require('react-xml-parser');
        var xml = new XMLParser().parseFromString(xhr.responseText);
        var items = xml.getElementsByTagName('item');
        var availCategorySet = new Set();

        /* read available category from API and store them into a set*/
        for(let i = 0; i < items.length; i++) {
          let item = items[i];
          let cat3 = item.getElementsByTagName('cat3');
          if(cat3.length == 1) {
            let cat3Code = cat3[0].value;
            availCategorySet.add(cat3Code)
          }
        }

        let allCategories = require('public/category/category.json'); /* load all category pack */
        let availCategories = [];
        let categoryAll = {key: "0", value: "전체"};
        availCategories.push(categoryAll);

        /* compare all category and set item and if the category is available one, 
         * push it into availCategories */
        for(let i = 0; i < allCategories.length; i++) {
          let category = allCategories[i];
          if(availCategorySet.has(category.key)) {
            availCategories.push(category);
          }
        }

        /* make category filter buttons */
        const filterButtonStyle = {
          width: '22%', // draw 4 buttons on single carousel
          margin: '1%',
          height: '30px',
          fontSize: '0.7em',
          padding: '1px'
        };

        let buttonStyle = {
          width: '2%',
          padding: '0px',
          height: '30px',
          fontSize: '0.7em'
        };

        const innerDivStyle = {
          textAlign: "center",
          margin: '0%',
          height: '30px'
        };

        let backButton = (
          <Button modifier='quiet' style={buttonStyle} onClick={this_.goBack.bind(this_)}>
            <div style={innerDivStyle}>&lt;</div>
          </Button>);

        let nextButton =(
          <Button modifier='quiet' style={buttonStyle} onClick={this_.goNext.bind(this_)}>
            <div style={innerDivStyle}>&gt;</div>
          </Button>); 

        let filterButtons = [];
        let filterCarouselItems = [];
        for(let i = 0; i < availCategories.length / 4; i++) {
          let start = i * 4;
          let end = start + 4;
          let buttonGroup = [];
          buttonGroup.push(backButton);
          for(let j = start; j < end; j++) {
            if(availCategories[j] != null) {
              let category = availCategories[j];
              let modifier = 'outline';
              if(j == 0) modifier = null;
              let button = (<Button key={category.key} style={filterButtonStyle} modifier={modifier}>
                <div style={innerDivStyle}>
                  {category.value}
                </div></Button>);
              buttonGroup.push(button);
            } else {
              let button = (<Button 
                style={{width:'21%', margin: '1%', height: '30px'}} modifier='quiet'>
                <div style={innerDivStyle}>
                </div></Button>);
              buttonGroup.push(button);
            }
          }
          buttonGroup.push(nextButton);
          filterButtons.push(buttonGroup);
          let carouselItem = (<CarouselItem key={i}>
            <div style={{textAlign: "left"}}>{buttonGroup}</div></CarouselItem>);
          filterCarouselItems.push(carouselItem);
        }

        this_.setState({
          items: items, 
          availCategories: availCategories, 
          filterButtons: filterButtons,
          filterCarouselItems: filterCarouselItems});

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForContentBase + code + this_.state.urlForContentRemain);
      xhr.send(null);
    });
  }

  goBack() {
    let change = this.state.filterCarouselIndex - 1 < 0 ? 
      this.state.filterButtons.length - 1 : 
      this.state.filterCarouselIndex - 1;
    this.setState({filterCarouselIndex: change});
  }

  goNext() {
    let change = this.state.filterCarouselIndex + 1 > this.state.filterButtons.length - 1 ? 
      0 : 
      this.state.filterCarouselIndex + 1;

    this.setState({filterCarouselIndex: change});
  }

  renderToolbar() {
    const imgStyle= {
      height: '35%',
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
    const centerDiv = {
      textAlign: 'center'
    };

    const innerDiv = {
      margin: '1%'
    };
    
    const hrStyle = {
      margin: '1px'
    };


    let carousel = this.state.filterCarouselItems == null ? null : 
      (<Carousel
         index={this.state.filterCarouselIndex} 
         swipeable autoScroll overscrollable>
           {this.state.filterCarouselItems}
       </Carousel>);

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={centerDiv}>
          <div style={innerDiv}>
            <Segment index={this.state.segmentIndex} 
              onPostChange={() => this.setState({segmentIndex: event.index})} style={{ width: '55%' }}>
              <Button>{this.props.strings.all}</Button>
              <Button>{this.props.strings.seoguipo}</Button>
              <Button>{this.props.strings.jeju}</Button>
            </Segment>
          </div>
          <div style={innerDiv}>
            <SearchInput placeholder='Search...' onChange={(e) => console.log(e.target.value)} />
          </div>
          <div style={{marginTop: '1%', marginBottom: '1%'}}>
            <MapContainer google={this.props.google} />
          </div>
          <div>
            <hr style={hrStyle}/>
            {carousel}
            <hr style={hrStyle}/>
          </div>
        </div>
      </Page>
    );
  }
}
