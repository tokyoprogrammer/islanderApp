import React from 'react';
import ReactDOM from 'react-dom';
import {List, ListItem, Checkbox, Button} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

export default class FavoriteListView extends React.Component {
  constructor(props) {
    super(props);

    let serviceLang = "";
    let lang = localStorage.getItem("lang");
    if(lang == 'kr') {
      serviceLang = "KorService";
    } else {
      serviceLang = "EngService";
    }

    let langFile = require('public/str/langPack.json'); /* load lang pack */
    let strings = new LocalizedStrings(langFile);
    strings.setLanguage(lang);

    let favorites = JSON.parse(localStorage.getItem('favorites'));
    if(favorites == null) {
      favorites = [];
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    const fixedAreaCode = 39; /* jeju island area code */
    const serviceKey = 
      "XU3%2BCzeg%2BV5ML42ythVLdLSe05DgiBqmS1wCZJfnhdpQ6X5y%2BB5W%2BJ3E%2B98cXaALAMFCqZQxlMdzLYrSy4fUrw%3D%3D";

    this.state = {
      urlForAllList: "https://api.visitkorea.or.kr/openapi/service/rest/"+ serviceLang + 
        "/areaBasedList?ServiceKey=" + 
        serviceKey + "&contentTypeId=&areaCode=" + fixedAreaCode + 
        "&sigunguCode=&cat1=&cat2=&cat3=&listYN=Y&MobileOS=ETC&" + 
        "MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=2000&pageNo=1",
      favorites: favorites,
      allSights: [],
      favoritesInfo: [],
      strings: strings
    }

    this.readList();
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
    return items;
  }

  readList() {
    var this_ = this;
    
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        this_.setState({allSights: ret});

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        notification.alert(this_.state.strings.oops);
        this_.setState({allSights: []});
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForAllList);
      xhr.send(null);
    }).then(function(result) {
      this_.makeList();
    }); 
  }

  makeList() {
    let allSights = this.state.allSights;
    let favorites = this.state.favorites;
    let favoritesInfo = [];

    for(let i = 0; i < allSights.length; i++) {
      let sight = allSights[i];
      for(let j = 0; j < favorites.length; j++) {
        let favorite = favorites[j];
        if(favorite == sight.contentid._text) {
          favoritesInfo.push(sight);
          break;
        }
      }
    }
    this.setState({favoritesInfo: favoritesInfo});
    this.props.onLoadDone();
  }

  renderCheckboxRow(row) {
    return (
      <ListItem key={row.contentid._text} tappable>
        <label className='left'>
          <Checkbox
            inputId={"checkbox-" + row.contentid._text}
          />
        </label>
        <div className='left'>
          {row.firstimage != null ? 
            (<img src={row.firstimage._text} className='list-item__thumbnail' />) :
            (<img src="img/noimage.png" className='list-item__thumbnail' />)}
        </div>
        <label htmlFor={"checkbox-" + row.contentid._text} className='center'>
          {row.title._text}
        </label>
        <div className='right'>
          <Button onClick={this.props.onMoreClicked.bind(this, row.contentid._text, row.contenttypeid._text)}>
            {this.state.strings.moredetails}
          </Button>
        </div>
      </ListItem>
    )
  }

  render() {
    return (
      <div>
        {this.state.favoritesInfo.length > 0 ? 
          (<List dataSource={this.state.favoritesInfo}
            renderRow={this.renderCheckboxRow.bind(this)}/>) :
          (<h3 style={{width: "100%", textAlign: "center"}}>
            {this.state.strings.nofavorites}
          </h3>)}
      </div>
    ); 
  }
}

FavoriteListView.propTypes = {
  onLoadDone: React.PropTypes.func,
  onMoreClicked: React.PropTypes.func, 
}
