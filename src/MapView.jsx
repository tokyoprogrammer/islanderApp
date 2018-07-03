import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col} from 'react-onsenui';

import MapContainer from './MapContainer'

export default class MapView extends React.Component {
  constructor(props) {
    super(props);

    let serviceLang = "";
    let lang = this.props.strings.getLanguage();
    if(lang == 'kr') {
      serviceLang = "KorService";
    } else {
      serviceLang = "EngService";
    }
   
    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";
    this.state = {
      urlForContentBase: "http://api.visitkorea.or.kr/openapi/service/rest/" + 
        serviceLang + "/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=", 
      urlForContentRemain: "&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC" + 
        "&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=1000&pageNo=1",
      segmentIndex: 0,
      itemCarouselIndex: 0,
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
        console.log(items);
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

        let categories_kr = require('public/category/category_kr.json'); /* load all category pack (kr) */
        let categories_en = require('public/category/category_en.json'); /* load all category pack (kr) */
        let categoryAll = {key: "0", value: "전체"};
        let allCategories = null;

        let lang = this_.props.strings.getLanguage();
        if(lang == 'kr') {
          allCategories = categories_kr;
        } else {
          allCategories = categories_en;
          categoryAll = {key: "0", value: "All"};
        }
 
        let availCategories = [];
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

        /* prev button for carousel */
        let backButton = (
          <Button modifier='quiet' style={buttonStyle} onClick={this_.goPrevFilterCarousel.bind(this_)}>
            <div style={innerDivStyle}>&lt;</div>
          </Button>);

        /* next button for carousel */
        let nextButton =(
          <Button modifier='quiet' style={buttonStyle} onClick={this_.goNextFilterCarousel.bind(this_)}>
            <div style={innerDivStyle}>&gt;</div>
          </Button>); 
        
        let filterButtons = [];
        let filterCarouselItems = [];
        // four buttons in a row, so make length / 4 size of carousel item
        for(let i = 0; i < availCategories.length / 4; i++) {
          // four buttons in a row
          let start = i * 4;
          let end = start + 4;
          // four buttons will be grouped in a buttonGroup array and then stored into a carousel item.
          let buttonGroup = [];
          // add prev button at first
          buttonGroup.push(backButton);
          for(let j = start; j < end; j++) {
            // if a item with index is not null or not undefined, make that into button with key.
            if(availCategories[j] != null) {
              let category = availCategories[j];
              let modifier = 'outline'; // default inactive button style is outline.
              if(j == 0) modifier = null; 
              // the first button is button for no filter. so let us make this button in active.
              let button = (
                <Button key={category.key} style={filterButtonStyle} modifier={modifier}
                  onClick={this_.toggleFilterStatus.bind(this_, category.key)}>
                  <div style={innerDivStyle}>
                    {category.value}
                  </div>
                </Button>);
              buttonGroup.push(button);
            } else {
              // make dummy button. if there is no proper item.
              let button = (<Button 
                style={{width:'21%', margin: '1%', height: '30px'}} modifier='quiet' disabled={true}>
                <div style={innerDivStyle}>
                </div></Button>);
              buttonGroup.push(button);
            }
          }
          // add next button at first
          buttonGroup.push(nextButton);
          filterButtons.push(buttonGroup);
          // make carousel item with grouped buttons.
          let carouselItem = (<CarouselItem key={i}>
            <div style={{textAlign: "left"}}>{buttonGroup}</div></CarouselItem>);
          // and add it.
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

  toggleFilterStatus(key) {
    let newArray = this.state.filterButtons.slice(); // copy the array
    let newCarouselItems = this.state.filterCarouselItems.slice(); // copy the array
    let indexToToggleI = 0;
    let indexToToggleJ = 0;
    let newButton = null;

    const filterButtonStyle = {
      width: '22%', // draw 4 buttons on single carousel
      margin: '1%',
      height: '30px',
      fontSize: '0.7em',
      padding: '1px'
    };

    const innerDivStyle = {
      textAlign: "center",
      margin: '0%',
      height: '30px'
    };

    /* search desired button in the button group */
    for(let i = 0; i < newArray.length; i++) {
      let buttonGroup = newArray[i];
      for(let j = 0; j < buttonGroup.length; j++) {
        let button = buttonGroup[j];
        if(button.key == key) {
          let modifier = button.props.modifier == 'outline' ? null : 'outline';

          let buttonNew = (
            <Button key={key} style={filterButtonStyle} modifier={modifier}
              onClick={this.toggleFilterStatus.bind(this, key)}>
              <div style={innerDivStyle}>
                {button.props.children.props.children}
              </div>
            </Button>);
          
          newArray[i][j] = buttonNew; // replace array with new button
          let newCarouselItem = (<CarouselItem key={i}>
            <div style={{textAlign: "left"}}>{newArray[i]}</div></CarouselItem>);

          newCarouselItems[i] = newCarouselItem;

          this.setState({filterButtons: newArray, filterCarouselItems: newCarouselItems}); // and change them.
          return;
        }
      }
    }
  }

  goPrevFilterCarousel() {
    let change = this.state.filterCarouselIndex - 1 < 0 ? 
      this.state.filterButtons.length - 1 : 
      this.state.filterCarouselIndex - 1;
    this.setState({filterCarouselIndex: change});
  }

  goNextFilterCarousel() {
    let change = this.state.filterCarouselIndex + 1 > this.state.filterButtons.length - 1 ? 
      0 : 
      this.state.filterCarouselIndex + 1;

    this.setState({filterCarouselIndex: change});
  }

  prevItem() {
    let change = this.state.itemCarouselIndex - 1 < 0 ?
      this.state.items.length - 1 :
      this.state.itemCarouselIndex - 1;
    this.setState({itemCarouselIndex: change});
  }

  nextItem() {
    let change = this.state.itemCarouselIndex + 1 > this.state.items.length - 1 ?
      0 :
      this.state.itemCarouselIndex + 1;
    console.log(change);
    this.setState({itemCarouselIndex: change});
  }

  goDetails(contentId, contentTypeId) {
    console.log(contentId + " : " + contentTypeId + " pressed");
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

    const arrowIconSize = {
      default: 30,
      material: 28
    };

    let filterCarousel = this.state.filterCarouselItems == null ? null : 
      (<Carousel
         index={this.state.filterCarouselIndex} 
         swipeable autoScroll overscrollable>
         {this.state.filterCarouselItems}
       </Carousel>);

    let itemsToDisplay = [];
    let placeCarouselItems = [];
    for(let i = 0; i < this.state.items.length; i++) {
      let item = this.state.items[i];
      let mapX = item.getElementsByTagName("mapx")[0].value;
      let mapY = item.getElementsByTagName("mapy")[0].value;
      let addr = item.getElementsByTagName("addr1")[0].value;
      let title = item.getElementsByTagName("title")[0].value;
      let tel = item.getElementsByTagName("tel");
      let image = item.getElementsByTagName("firstimage");
      let zipCode = item.getElementsByTagName("zipcode");
      let contentId = item.getElementsByTagName("contentid")[0].value;
      let contentTypeId = item.getElementsByTagName("contenttypeid")[0].value;

      let carouselKey = "carousel-" + contentId;

      let imageSrc = image.length == 0 ? 
        (<img src="img/noimage.png" style={{width: "100%"}}/>) : 
        (<img src={image[0].value} style={{width: "100%"}} />);

      
      let telLink = tel.length == 0 ? null : "tel:" + tel[0].value;
      let telTag = tel.length == 0 ? null : 
        (<a href={telLink}>{tel[0].value}</a>);
      let detailButton = (
        <Button key={contentId} onClick={this.goDetails.bind(this, contentId, contentTypeId)}>
         {this.props.strings.godetails}
        </Button>);
      let zipCodeString = zipCode.length == 0 ? null : 
        this.props.strings.zipcode + " : " + zipCode[0].value;

      let placeCarouselItem = (
        <CarouselItem key={carouselKey} style={{backgroundColor: item}}>
          <div style={{height: "35%", padding: "1px 0 0 0"}}>
            <div className="card">
              <h2 className="card__title">{title}</h2>
              <div className="card__content">
                <Row style={{width: "100%"}}>
                  <Col width="5%">
                    <Button modifier='quiet' 
                      onClick={this.prevItem.bind(this)} 
                      style={{width: '10px', padding: "1%"}}>
                      <Icon icon='md-chevron-left' size={arrowIconSize} />
                    </Button>
                  </Col>
                  <Col width="37%">
                    <div style={{textAligh: "center", padding: "1%"}}>
                      {imageSrc}
                    </div>
                  </Col>
                  <Col width="53%">
                    <div style={{padding: "1%"}}>
                      <p style={{margin: "1%"}}>{addr}</p>
                      <p style={{color: "#A9A9A9", margin: "1%"}}>{zipCodeString}</p>
                      <p style={{margin: "1%"}}>{telTag}</p>
                      <div style={{margin: "2%"}}>
                        {detailButton}
                      </div>
                    </div>
                  </Col>
                  <Col width="5%">
                    <Button modifier='quiet' 
                      onClick={this.nextItem.bind(this)} 
                      style={{width: '10px', padding: "1%"}}>
                      <Icon icon='md-chevron-right' size={arrowIconSize} />
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </CarouselItem>);

      placeCarouselItems.push(placeCarouselItem);
    }

    let placeCarousel = this.state.items == null ? <Icon spin icon='md-spinner' /> :
      (<Carousel
         index = {this.state.itemCarouselIndex}
         swipeable autoScroll overscrollable>
         {placeCarouselItems}
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
            {filterCarousel}
            <hr style={hrStyle}/>
          </div>
          <div>
            {placeCarousel}
          </div>
        </div>
      </Page>
    );
  }
}
