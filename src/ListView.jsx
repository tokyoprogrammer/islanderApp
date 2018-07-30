import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, LazyList, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import DetailView from './DetailView';
import TopToggleView from './TopToggleView';
import TopSearchView from './TopSearchView';
import FilterCarouselView from './FilterCarouselView';
import GooglePlaceImageView from './GooglePlaceImageView';

export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);

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
    
    this.listItemHeight = 130;
 
    this.state = {
      items: cache.items,
      filteredItems: cache.items,
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
    let filteredItems = this.processFilter(this.state.sigunguCode, newFilteredList)
    this.setState({
      filteredItems: filteredItems,
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
    let filteredItems = this.processFilter(this.state.sigunguCode, this.state.filtered)
    let searchedItems = [];

    if(string.length > 1) {
      for(let i = 0; i < filteredItems.length; i++) {
        let item = filteredItems[i];
        let title = item.title == null ? "" : item.title._text;
        if(string.length > 1 && title.includes(string) == false) continue;
        searchedItems.push(item);
      }
    } else {
      searchedItems = filteredItems;
    }

    this.setState({filteredItems: searchedItems});
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

  handleAddressFilter(e) {
    let sigunguCode = 0;

    if (e.index == 0) sigunguCode = 0; // 0 means all
    else if(e.index == 1) sigunguCode = 3; // seoguipo code == 3 
    else if(e.index == 2) sigunguCode = 4; // jeju code == 4
    else {
      console.log("Unknown index of button selected.");
      sigunguCode = 0; // default all
    }

    let filteredItems = this.processFilter(sigunguCode, this.state.filtered)

    this.setState({
      filteredItems: filteredItems,
      sigunguCode: sigunguCode,
      segmentIndex: e.index});
  }
 
  handleSearchButton() {
    this.searchUsingSearchString(this.state.searchString);
  }
  
  processFilter(sigunguCode, filtered) {
    let filteredItems = [];

    for(let i = 0; i < this.state.items.length; i++) {
      let item = this.state.items[i];
      let sigunguCodeOfItem = item.sigungucode == null ? null : item.sigungucode._text;
      let proceed = false;

      if(sigunguCode != 0 && sigunguCodeOfItem != sigunguCode) continue;

      if(filtered.length >= 1) {
        let cat3 = item.cat3 == null ? "" : item.cat3._text;

        for(let j = 0; j < filtered.length; j++) {
          let filter = filtered[j];
          if(filter == cat3) { // check whether this item's category is in the filter or not 
            proceed = true;
            break;
          }
        }
      }

      if(!proceed && filtered.length >= 1) continue; // if filter activated && not proceed,

      filteredItems.push(item);
    }

    return filteredItems;
  }
 
  renderRow(index) {
    if(index >= this.state.filteredItems.length) return;
    const imageWidth = 60;
    const imageStyle = {width: imageWidth + "px"};
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

    let itemInfo = this.state.filteredItems[index];

    let contentId = itemInfo.contentid == null ? null : itemInfo.contentid._text;
    let mapX = itemInfo.mapx == null ? null : itemInfo.mapx._text;
    let mapY = itemInfo.mapy == null ? null : itemInfo.mapy._text;
    let contentTypeId = itemInfo.contenttypeid == null ? null : itemInfo.contenttypeid._text;
    let addr = itemInfo.addr1 == null ? "" : itemInfo.addr1._text;
    if(contentId == null || contentTypeId == null || mapX == null || mapY == null) return null;
 
    let title = itemInfo.title == null ? "" : itemInfo.title._text;
    
    let itemImage = itemInfo.firstimage == null ? 
      (<GooglePlaceImageView maxWidth = {imageWidth} maxHeight = {this.listItemHeight} 
        placeTitle = {title} style={imageStyle} />) :
      (<img src={itemInfo.firstimage._text} style={imageStyle} />);

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
      <ListItem key={contentId} style={listItemStyle} modifier="chevron" tappable
        onClick={this.goDetails.bind(this, contentId, contentTypeId)}>
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

  goDetails(contentId, contentTypeId) {
    localStorage.setItem("contentId", contentId);
    localStorage.setItem("contentTypeId", contentTypeId);
    this.props.navigator.pushPage({ 
      component: DetailView 
    });
  }

  goTopScroll() {
    window.scrollTo(0, 0);
  }

  render() {
    let fullHeight = window.innerHeight;
    const imageHeight = (fullHeight * 0.4) + "px"; // 40%
    const hrStyle = {
      margin: '1px'
    };

    const styleToolbar = {
      textAlign: 'center', 
      width: fullWidth, 
      margin: '0px',
      backgroundColor: "#efeff4"
    };

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
        <div className="content" style={{textAlign: 'center', width: fullWidth}}>
          <LazyList length={this.state.filteredItems.length} 
            renderRow={this.renderRow.bind(this)} 
            calculateItemHeight={() => this.listItemHeight} />
        </div>
        <Fab onClick={this.goTopScroll.bind(this)} position = "bottom right">
          <Icon icon='md-format-valign-top' />
        </Fab>
      </Page>
    );
  }
}
