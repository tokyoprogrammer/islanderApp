import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, LazyList, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

export default class ListView extends React.Component {
  constructor(props) {
    super(props);

    let serviceLang = "";
    let lang = localStorage.getItem("lang");
 
    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if(favorites == null) favorites = [];
    // make or read favorite list
  
    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let selectedCode = localStorage.getItem("code");
    let cache = JSON.parse(localStorage.getItem("items" + selectedCode));
    let availCategories = this.makeAvailCategoryListFromItems(cache.items);
    let filterCarouselItems = this.drawCategoryCarousel(availCategories, []);
    
    this.listItemHeight = 110;
 
    this.state = {
      items: cache.items,
      favorites: favorites,
      strings: strings,
      filtered: [],
      filterCarouselItems: filterCarouselItems,
      availCategories: availCategories,
      filterCarouselIndex: 0,
      searchString: "",
      sigunguCode: 0,
      segmentIndex: 0
    };
  }

  makeAvailCategoryListFromItems(items) {
    var availCategorySet = new Set();

    /* read available category from API and store them into a set*/
    for(let i = 0; i < items.length; i++) {
      let item = items[i];
      let cat3 = item.cat3;
      if(cat3 != null) {
        let cat3Code = cat3._text;
        availCategorySet.add(cat3Code)
      }
    }

    let categories_kr = require('public/category/category_kr.json'); /* load all category pack (kr) */
    let categories_en = require('public/category/category_en.json'); /* load all category pack (kr) */
    let categoryAll = {key: "0", value: "전체"};
    let allCategories = null;

    let lang = localStorage.getItem("lang");
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

    return availCategories;
  }

  drawCategoryCarousel(availCategories, filtered) {
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
      <Button modifier='quiet' style={buttonStyle} onClick={this.goPrevFilterCarousel.bind(this)}>
        <div style={innerDivStyle}>&lt;</div>
      </Button>);

    /* next button for carousel */
    let nextButton =(
      <Button modifier='quiet' style={buttonStyle} onClick={this.goNextFilterCarousel.bind(this)}>
        <div style={innerDivStyle}>&gt;</div>
      </Button>); 
    
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
          if(filtered.length <= 0) {
            if(j == 0) modifier = null;
          }
          else {
            for(let fi = 0; fi < filtered.length; fi++) {
              if(filtered[fi] == category.key) {
                modifier = null;
                break;
              }
            }
          }

          // the first button is button for no filter. so let us make this button in active.
          let button = (
            <Button key={category.key} style={filterButtonStyle} modifier={modifier}
              onClick={this.toggleFilterStatus.bind(this, category.key)}>
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
      // make carousel item with grouped buttons.
      let carouselItem = (<CarouselItem key={i}>
        <div style={{textAlign: "left"}}>{buttonGroup}</div></CarouselItem>);
      // and add it.
      filterCarouselItems.push(carouselItem);
    }

    return filterCarouselItems;
  }

  showMenu() {
    this.props.showMenu();
  }

  goPrevFilterCarousel() {
    let change = this.state.filterCarouselIndex - 1 < 0 ? 
      Math.round(this.state.availCategories.length / 4) - 1 : 
      this.state.filterCarouselIndex - 1;

    this.setState({filterCarouselIndex: change});
  }

  goNextFilterCarousel() {
    let change = this.state.filterCarouselIndex + 1 > Math.round(this.state.availCategories.length / 4) - 1 ? 
      0 : 
      this.state.filterCarouselIndex + 1;

    this.setState({filterCarouselIndex: change});
  }

  toggleFilterStatus(key) {
    let newFiltered = this.state.filtered.slice(); // copy the array
    if(key == '0') {
      // When 'All' button(key: 0) is clicked?
      // Turn on 'All' button. And clear filter.
      newFiltered = [];
    }
    else {
      let indexToRemove = -1;
      
      for(let i = 0; i < newFiltered.length; i++) {
        let filter = newFiltered[i];
        if(filter == key) {
          indexToRemove = i;
          break;
        }
      }
      if(indexToRemove == -1)
      {
        newFiltered.push(key);
      } else {
        newFiltered.splice(indexToRemove, 1); // remove item
      }
    }
    
    let filterCarouselItems = this.drawCategoryCarousel(this.state.availCategories, newFiltered);

    this.setState({
      filterCarouselItems: filterCarouselItems,
      filtered: newFiltered});
  }


  renderToolbar() {
    const imgStyle= {
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

  toggleFavorite(key) {
    let favoritesCopy = this.state.favorites.slice(0); // copy array
    let indexToRemove = -1;
    for(let i = 0; i < favoritesCopy.length; i++) {
      let favorite = favoritesCopy[i];
      if(favorite == key) {
        indexToRemove = i;
        break;
      }     
    }
    if(indexToRemove == -1)
    {
      favoritesCopy.push(key); // push to favorite list
    } else {
      favoritesCopy.splice(indexToRemove, 1); // remove untoggled favorate
    }
    localStorage.setItem("favorites", JSON.stringify(favoritesCopy)); // change favorite list and save it.

    this.setState({favorites: favoritesCopy});
  }

  searchUsingSearchString(string) {
    console.log(string);
  } 
 
  handleSearchBox(e) {
    let searchString = e.target.value;
    if(searchString.length <= 0) {
      // clear search
      this.searchUsingSearchString("");
    }
    this.setState({searchString: searchString});
  }
 
  handleCategoryChange(e) {
    this.setState({filterCarouselIndex: e.activeIndex});
  }

  handleAddressFilter(e) {
    let sigunguCode = 0;

    if (e.index == 0) sigunguCode = 0; // 0 means all
    else if(e.index == 1) sigunguCode = 3; // seoguipo code == 3 
    else if(e.index == 2) sigunguCode = 4; // jeju code == 4
    else {
      console.log("Unknown index of button selected.");
      sigunguCode = 0; // default all
    }

    this.setState({
      sigunguCode: sigunguCode,
      segmentIndex: e.index});
  }
 
  handleSearchButton() {
    this.searchUsingSearchString(this.state.searchString);
  }
  
  renderRow(index) {
    const imageStyle = {width: "60px"};
    const grayColor = "#D3D3D3";
    const goldColor = "#FFD700";
    const starIconSize = {
      default: 30,
      material: 28
    };
    const listItemStyle = {
      height: this.listItemHeight,
      paddingTop: "2px",
      paddingBottom: "2px"
    };

    let itemInfo = this.state.items[index];

    let contentId = itemInfo.contentid == null ? null : itemInfo.contentid._text;
    let mapX = itemInfo.mapx == null ? null : itemInfo.mapx._text;
    let mapY = itemInfo.mapy == null ? null : itemInfo.mapy._text;
    let contentTypeId = itemInfo.contenttypeid == null ? null : itemInfo.contenttypeid._text;
    let addr = itemInfo.addr1 == null ? "" : itemInfo.addr1._text;
    if(contentId == null || contentTypeId == null || mapX == null || mapY == null) return null;
    
    let itemImage = itemInfo.firstimage == null ? 
      (<img src="img/noimage.png" style={imageStyle} />) :
      (<img src={itemInfo.firstimage._text} style={imageStyle} />);
    let title = itemInfo.title == null ? "" : itemInfo.title._text;
    let tel = itemInfo.tel;
    let telLink = tel == null ? null : "tel:" + tel._text;
    let telTag = tel == null ? null : 
      (<a href={telLink}>{tel._text}</a>);

    let starColor = grayColor;
    let favorites = this.state.favorites;

    for(let j = 0; j < favorites.length; j++) {
      if(favorites[j] == contentId) {
        starColor = goldColor; // change star color
        break;
      }
    }

    return (
      <ListItem key={contentId} style={listItemStyle}>
        <div className='left'>{itemImage}</div>
        <div className='center' style = {{paddingTop: '2px', paddingBottom: '2px'}}>
          <h3 style={{margin:"1px"}}>{title}</h3>
          <p style={{margin:"1px", color: "#A9A9A9"}}>{addr}</p>
          {telTag}
        </div>
        <div className='right'>
          <Button modifier='quiet' 
            style={{width: '100%', textAlign: "center", color: starColor}}
            onClick={this.toggleFavorite.bind(this, contentId)}>
            <Icon icon='md-star' size={starIconSize}/>
          </Button>
        </div>
      </ListItem>);
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

    const searchIconSize = {
      default: 24,
      material: 22
    };

    const styleToolbar = {
      textAlign: 'center', 
      width: fullWidth, 
      margin: '0px'};

    let fullWidth = window.innerWidth + "px";
 
    let filterCarousel = this.state.filterCarouselItems.length <= 0 ? "Loading..." : 
      (<Carousel
         style={{width: fullWidth}}
         onPostChange={this.handleCategoryChange.bind(this)} 
         index={this.state.filterCarouselIndex} 
         autoScrollRatio={0.3} 
         autoScroll overscrollable swipeable>
         {this.state.filterCarouselItems}
       </Carousel>);
   
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={styleToolbar}>
          <div style={innerDiv}>
            <Segment index={this.state.segmentIndex} 
              onPostChange={this.handleAddressFilter.bind(this)} style={{ width: '55%' }}>
              <Button>{this.state.strings.all}</Button>
              <Button>{this.state.strings.seoguipo}</Button>
              <Button>{this.state.strings.jeju}</Button>
            </Segment>
          </div>
          <div style={innerDiv}>
            <SearchInput
              placeholder='Search...' onChange={this.handleSearchBox.bind(this)} />
            <Button onClick={this.handleSearchButton.bind(this)} 
              modifier='quiet' style={{margin: '2px', padding: '2px'}}>
              <Icon icon='md-search' size={searchIconSize} />
            </Button>
          </div>
          <div>
            <hr style={hrStyle}/>
            {filterCarousel}
            <hr style={hrStyle}/>
          </div>
        </div>
        <div style={{textAlign: 'center', width: fullWidth, top: '190px'}}>
          <LazyList length={this.state.items.length} 
            renderRow={this.renderRow.bind(this)} 
            calculateItemHeight={() => this.listItemHeight} />
        </div>
      </Page>
    );
  }
}
