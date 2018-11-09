import React from 'react';
import ReactDOM from 'react-dom';
import {Carousel, CarouselItem, Button} from 'react-onsenui';

import {FilterCarouselViewStyle} from './Styles';

export default class FilterCarouselView extends React.Component {
  constructor(props) { 
    super(props);
    this.state = {
      availCategories: [],
      filterCarouselIndex: 0,
      filterCarouselItems: [],
      filtered: []
    };
  }
  
  componentDidMount() {
    if(this.props.items != null && this.props.items.length > 0) {
      // Almost constructor. This if statement will be activated when items are not loaded in lazy-loading.
      let availCategories = this.makeAvailCategoryListFromItems(this.props.items);
      let filterCarouselItems = this.drawCategoryCarousel(availCategories, []);
      this.setState({
        availCategories: availCategories,
        filterCarouselItems: filterCarouselItems});

      const sleepTime = 500;
      var this_ = this;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        let clickedCategory = localStorage.getItem("clickedCategory");
        if(clickedCategory != null && clickedCategory != 0) {
        
          this_.toggleFilterStatus(clickedCategory);
          localStorage.setItem("clickedCategory", 0);
        }
      });
    }
  } 
 
  componentDidUpdate(prevProps) {
    if (this.props.items !== prevProps.items) {
      // Almost constructor. This if statement will be activated when props items is changed.
      // Which usually means complete redraw.
      let availCategories = this.makeAvailCategoryListFromItems(this.props.items);
      let filterCarouselItems = this.drawCategoryCarousel(availCategories, []);
      this.setState({
        availCategories: availCategories,
        filterCarouselItems: filterCarouselItems});

      const sleepTime = 500;
      var this_ = this;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        let clickedCategory = localStorage.getItem("clickedCategory");
        if(clickedCategory != null && clickedCategory != 0) {
        
          this_.toggleFilterStatus(clickedCategory);
          localStorage.setItem("clickedCategory", 0);
        }
      });
    }
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

    let lang = this.props.strings.getLanguage();
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
    const Styles = FilterCarouselViewStyle.carouselitem;
    /* make category filter buttons */
    const filterButtonStyle = Styles.filterBtn.style;
    const buttonStyle = Styles.arrowBtn.style;
    const innerDivStyle = Styles.arrowBtn.innerDiv.style;

    /* prev button for carousel */
    let backButton = (
      <Button modifier='quiet' style={buttonStyle} onClick={this.goPrevClicked.bind(this)}>
        <div style={innerDivStyle}>&lt;</div>
      </Button>);

    /* next button for carousel */
    let nextButton =(
      <Button modifier='quiet' style={buttonStyle} onClick={this.goNextClicked.bind(this)}>
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
            style={filterButtonStyle} modifier='quiet' disabled={true}>
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

  handleCategoryChange(e) {
    this.setState({filterCarouselIndex: e.activeIndex});
  }

  goPrevClicked() {
    let change = this.state.filterCarouselIndex - 1 < 0 ? 
      Math.round(this.state.availCategories.length / 4) - 1 : 
      this.state.filterCarouselIndex - 1;

    this.setState({filterCarouselIndex: change});
  }

  goNextClicked() {
    let change = this.state.filterCarouselIndex + 1 > Math.round(this.state.availCategories.length / 4) - 1 ? 
      0 : 
      this.state.filterCarouselIndex + 1;

    this.setState({filterCarouselIndex: change});
  }

  toggleFilterStatus(key) {
    let newFilteredList = this.state.filtered.slice(); // copy the array
    if(key == '0') {
      // When 'All' button(key: 0) is clicked?
      // Turn on 'All' button. And clear filter.
      newFilteredList = [];
    }
    else {
      let indexToRemove = -1;
      
      for(let i = 0; i < newFilteredList.length; i++) {
        let filter = newFilteredList[i];
        if(filter == key) {
          indexToRemove = i;
          break;
        }
      }
      if(indexToRemove == -1)
      {
        newFilteredList.push(key);
      } else {
        newFilteredList.splice(indexToRemove, 1); // remove item
      }
    }
    
    let filterCarouselItems = this.drawCategoryCarousel(this.state.availCategories, newFilteredList);

    this.setState({
      filterCarouselItems: filterCarouselItems,
      filtered: newFilteredList});

    this.props.onFilterClicked(newFilteredList);
  }

  render() {
    const hrStyle= {
      margin: "1px"
    };
    let filterCarousel = this.state.filterCarouselItems.length <= 0 ? (<p>Loading...</p>) : 
      (<Carousel
         style={{width: this.props.width}}
         onPostChange={this.handleCategoryChange.bind(this)} 
         index={this.state.filterCarouselIndex} 
         autoScrollRatio={0.3} 
         autoScroll overscrollable swipeable>
         {this.state.filterCarouselItems}
       </Carousel>);

    return (<div><hr style={hrStyle}/>{filterCarousel}<hr style={hrStyle} /></div>);
  }
}

FilterCarouselView.propTypes = {
  width: React.PropTypes.string,
  strings: React.PropTypes.object,
  items: React.PropTypes.array,
  onFilterClicked: React.PropTypes.func
}
