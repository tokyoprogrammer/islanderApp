import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, LazyList, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import TopToggleView from './TopToggleView';
import TopSearchView from './TopSearchView';
import FilterCarouselView from './FilterCarouselView';

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
    
    this.listItemHeight = 110;
 
    this.state = {
      items: cache.items,
      favorites: favorites,
      strings: strings,
      filtered: [],
      filterCarouselIndex: 0,
      searchString: "",
      sigunguCode: 0,
      segmentIndex: 0
    };
  }

  showMenu() {
    this.props.showMenu();
  }

  toggleFilterStatus(newFilteredList) {
    this.setState({
      filtered: newFilteredList});
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
    const hrStyle = {
      margin: '1px'
    };

    const styleToolbar = {
      textAlign: 'center', 
      width: fullWidth, 
      margin: '0px'};

    let fullWidth = window.innerWidth + "px";

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div style={styleToolbar}>
          <TopToggleView index = {this.state.segmentIndex}
            onPostChange = {this.handleAddressFilter.bind(this)}
            strings = {this.state.strings} />
          <TopSearchView onChange={this.handleSearchBox.bind(this)} 
            onClick={this.handleSearchButton.bind(this)}/> 
          <div>
            <hr style={hrStyle}/>
            <FilterCarouselView 
              width = {fullWidth}
              strings = {this.state.strings} 
              items = {this.state.items}
              onFilterClicked = {this.toggleFilterStatus.bind(this)}
            />  
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
