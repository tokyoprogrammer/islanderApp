import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, Segment, SearchInput, Carousel, CarouselItem, Row, Col, ProgressCircular, Fab, LazyList, ListItem} from 'react-onsenui';

import LocalizedStrings from 'react-localization';

import DetailView from './DetailView';
import TopToggleView from './TopToggleView';
import TopSearchView from './TopSearchView';
import FilterCarouselView from './FilterCarouselView';
import GooglePlaceImageView from './GooglePlaceImageView';

import {ToolbarStyle, ListViewStyle, CenterDivStyle} from './Styles';

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

    let categories = [];
    if(lang == "kr") {
      categories = require('public/category/category_kr.json');
    } else {
      categories = require('public/category/category_en.json');
    }

    let categoriesMap = {};
    for(let i = 0; i < categories.length; i++) {
      let item = categories[i]; 
      categoriesMap[item.key] = item.value;
    }

    this.categories = categoriesMap;

    let selectedCode = localStorage.getItem("code");
    let cache = JSON.parse(localStorage.getItem("items" + selectedCode));
    
    this.listItemHeight = ListViewStyle.listItemHeight;
 
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
    this.stopPropagation = false;
  }

  componentDidUpdate(prevProps) {
    let favorites = localStorage.getItem('favorites');
    if(favorites != JSON.stringify(this.state.favorites)) {
      favorites = JSON.parse(favorites);
      
      this.setState({favorites: favorites});
    } 
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
    return (
      <Toolbar>
        <div className="left"><BackButton></BackButton></div>
        <div className="center">
          <img src={ToolbarStyle.title.imgs.logo.url} style={ToolbarStyle.title.imgs.logo.style} />
        </div>
        <div className='right'>
          <ToolbarButton onClick={this.showMenu.bind(this)}>
            <Icon icon={ToolbarStyle.menu.icon} size={ToolbarStyle.menu.size} />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  }

  renderFixed() {
    return (
      <Fab onClick={this.goTopScroll.bind(this)} 
        position={ListViewStyle.fixedFab.position}>
        <Icon icon={ListViewStyle.fixedFab.icon} />
      </Fab>
    );
  }

  toggleFavorite(key) {
    // event.stopPropagation(); // doesn't work.
    this.stopPropagation = true;
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
     
    return searchedItems;
  } 
 
  handleSearchBox(value) {
    let searchString = value;
    if(searchString.length <= 0) {
      // clear search
      this.searchUsingSearchString("");
    }
    this.setState({searchString: searchString});
  }

  handleAddressFilter(index) {
    let sigunguCode = 0;

    if (index == 0) sigunguCode = 0; // 0 means all
    else if(index == 1) sigunguCode = 3; // seoguipo code == 3 
    else if(index == 2) sigunguCode = 4; // jeju code == 4
    else {
      console.log("Unknown index of button selected.");
      sigunguCode = 0; // default all
    }

    let filteredItems = this.processFilter(sigunguCode, this.state.filtered)

    this.setState({
      filteredItems: filteredItems,
      sigunguCode: sigunguCode,
      segmentIndex: index});
  }
 
  handleSearchButton() {
    let searchedItems = this.searchUsingSearchString(this.state.searchString);
    this.setState({filteredItems: searchedItems});
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
 
  createMarkup(text) {
    return {__html: text }; 
  }

  renderRow(index) {
    if(index >= this.state.filteredItems.length) return;
    const Styles = ListViewStyle.listRow;
    const grayColor = Styles.starIcon.color.gray;
    const goldColor = Styles.starIcon.color.gold;

    let itemInfo = this.state.filteredItems[index];

    let contentId = itemInfo.contentid == null ? null : itemInfo.contentid._text;
    let mapX = itemInfo.mapx == null ? null : itemInfo.mapx._text;
    let mapY = itemInfo.mapy == null ? null : itemInfo.mapy._text;
    let contentTypeId = itemInfo.contenttypeid == null ? null : itemInfo.contenttypeid._text;
    let addr = itemInfo.addr1 == null ? "" : itemInfo.addr1._text;
    if(contentId == null || contentTypeId == null || mapX == null || mapY == null) return null;
 
    let title = itemInfo.title == null ? "" : itemInfo.title._text;
    if(this.state.strings.getLanguage() != "kr") {
      let tempTitle = title.split("(");
      if(tempTitle.length > 0) title = tempTitle[0];
    }
    
    let itemImage = itemInfo.firstimage == null ? 
      (<GooglePlaceImageView maxWidth = {Styles.image.width} maxHeight = {Styles.image.height} 
        placeTitle = {title} listThumbnail = {true} multi = {false} />) :
      (<img src={itemInfo.firstimage._text} style={Styles.image.style} />);

    let tel = itemInfo.tel;

    let starColor = grayColor;
    let favorites = this.state.favorites;

    for(let j = 0; j < favorites.length; j++) {
      if(favorites[j] == contentId) {
        starColor = goldColor; // change star color
        break;
      }
    }

    let cat3 = itemInfo.cat3 != null ? this.categories[itemInfo.cat3._text] : null;
    let badge = cat3 != null ? (<span style={Styles.badge.style}>{cat3}</span>) : null;

    return (
      <ListItem key={contentId} style={Styles.item.style} modifier="chevron" tappable
        onClick={this.goDetails.bind(this, contentId, contentTypeId)}>
        <Row style={Styles.style}>
        <Col width={Styles.cols.col1.width}>
          {itemImage}
        </Col>
        <Col width={Styles.cols.col2.width}>
          <b style={Styles.cols.col2.title.style}>{title}</b>{badge}
          {this.state.strings.getLanguage() == "kr" ? 
            (<p style={Styles.cols.col2.addr.style}>{addr}</p>) : null }
          {tel != null && this.state.strings.getLanguage() == "kr" ? 
            (<div dangerouslySetInnerHTML={this.createMarkup(tel._text)} />) : null}
        </Col>
        <Col width={Styles.cols.col3.width}>
          <Button modifier='quiet' 
            style={Object.assign({color: starColor}, Styles.cols.col3.button.style)}
            onClick={this.toggleFavorite.bind(this, contentId)}>
            <Icon icon={Styles.starIcon.icon} size={Styles.starIcon.size}/>
          </Button>
        </Col>
        </Row>
      </ListItem>);
  }

  goDetails(contentId, contentTypeId) {
    if(this.stopPropagation) {
      this.stopPropagation = false;
      return;
    }
    localStorage.setItem("contentId", contentId);
    localStorage.setItem("contentTypeId", contentTypeId);
    this.props.navigator.pushPage({ 
      component: DetailView 
    });
  }

  goTopScroll() {
    let elmnt = document.getElementById("top");
    elmnt.scrollIntoView(); 
  }

  render() {
    let fullWidth = window.innerWidth + "px";

    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}
        renderFixed={this.renderFixed.bind(this)}>
        <div style={CenterDivStyle} id="top">
          <TopToggleView index = {this.state.segmentIndex}
            onPostChange = {this.handleAddressFilter.bind(this)}
            strings = {this.state.strings} />
          <TopSearchView onChange={this.handleSearchBox.bind(this)} 
            onClick={this.handleSearchButton.bind(this)}/> 
          <div>
            <FilterCarouselView 
              width = {fullWidth}
              strings = {this.state.strings} 
              items = {this.state.items}
              onFilterClicked = {this.toggleFilterStatus.bind(this)}
            />  
          </div>
        </div>
        <div className="content" style={Object.assign({width: fullWidth}, CenterDivStyle)}>
          <LazyList length={this.state.filteredItems.length} 
            renderRow={this.renderRow.bind(this)} 
            calculateItemHeight={() => this.listItemHeight} />
        </div>
      </Page>
    );
  }
}
