import React from 'react';
import ReactDOM from 'react-dom';
import {List, ListItem, Checkbox, Button, ListHeader, Icon} from 'react-onsenui';
import {notification} from 'onsenui';

import LocalizedStrings from 'react-localization';

import MapContainer from './MapContainer';
import Marker from './Marker';

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
      strings: strings,
      checkedSights: []
    }

    this.readList(lang);

    var this_ = this;
    const sleepTime = 1500;
    new Promise(function(resolve, reject) {
      setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
    }).then(function(result) {
      this_.setState({});
    });
  }

  componentDidUpdate(prevProps) {
    let favorites = localStorage.getItem('favorites');
    if(favorites != JSON.stringify(this.state.favorites)) {
      this.setState({favorites: JSON.parse(favorites)});
    } 
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    var items = xml.response.body.items.item;
    return items;
  }

  readList(lang) {
    let cache = JSON.parse(localStorage.getItem("itemsAllSights" + lang));
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
      const sleepTime = 500;
      // lazy loading using Promise mechanism
      new Promise(function(resolve, reject) {
        setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
      }).then(function(result) {
        this_.setState({allSights: cache.items});
        this_.makeList();
      });
    } else {
      var this_ = this;
    
      new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest;
        xhr.onload = function() {
          let ret = this_.readItemsFromResponseText(xhr.responseText);
          this_.setState({allSights: ret});

          let cache = {
            createdDateTime: new Date(),
            items: ret
          };

          localStorage.setItem("itemsAllSights" + lang, JSON.stringify(cache));

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

    var this_ = this;
    const sleepTime = 1500;
    new Promise(function(resolve, reject) {
      setTimeout(resolve, sleepTime, 1); // set some timeout to render page first
    }).then(function(result) {
      this_.setState({});
    });
  }

  toggleFavorite(key) {
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

  onChange(id, e) {
    if(this.props.onCheckChanged) {
      this.props.onCheckChanged(e.target.checked, id);
    }

    let checkedSights = this.state.checkedSights.slice(0); // copy array
    if(e.target.checked) {
      checkedSights.push(id);
    } else {
      let index = checkedSights.indexOf(id);
      if(index > -1) {
        checkedSights.splice(index, 1);
      }
    }
    this.setState({checkedSights: checkedSights});
  }

  renderCheckboxRow(row) {
    const grayColor = "#D3D3D3";
    const goldColor = "#FFD700";
    const starIconSize = {
      default: 30,
      material: 28
    };
 
    return (
      <ListItem key={row.contentid._text} tappable modifier="longdivider">
        <label className='left'>
          {this.props.showStar ? 
            (<Button modifier='quiet' 
              style={{
                width: '100%', 
                textAlign: "center", 
                color: this.state.favorites.includes(row.contentid._text) ? 
                  goldColor : grayColor
                }}
              onClick={this.toggleFavorite.bind(this, row.contentid._text)}>
              <Icon icon='md-star' size={starIconSize}/>
            </Button>) :
            (<Checkbox onChange={this.onChange.bind(this, row.contentid._text)} 
              inputId={"checkbox-" + row.contentid._text}/>)}
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

  markerClicked(e, id) {
  }

  drawSingleMarker(lat, lng, color, zIndex, id) {
    let markerKey = "marker-" + id;
    return (<Marker key = {markerKey} 
             position = {{lat: lat, lng: lng}} color = {color} zIndex = {zIndex} id = {id}
             onClick = {this.markerClicked.bind(this)} />);
  }

  render() {
    const markerGray = 'C0C0C0';
    const markerChrimsonRed = 'DC134C'
    const mapCenter = {
      lat: 33.356432,
      lng: 126.5268767
    };

    const mapZoom = 9;

    return (
      <div>
        {this.state.favoritesInfo.length > 0 ?
        (<MapContainer initialCenter={mapCenter} zoom={mapZoom} google={this.props.google} 
          width = "100vw" height = "30vh">
          {this.state.favoritesInfo.map((item, index) => { 
            if(this.props.showStar) {
              return this.state.favorites.includes(item.contentid._text) ? 
                this.drawSingleMarker(item.mapy._text, item.mapx._text, markerChrimsonRed, index, index) :
                this.drawSingleMarker(item.mapy._text, item.mapx._text, markerGray, index, index);
            } else {
              return this.state.checkedSights.includes(item.contentid._text) ? 
                this.drawSingleMarker(item.mapy._text, item.mapx._text, markerChrimsonRed, index, index) :
                this.drawSingleMarker(item.mapy._text, item.mapx._text, markerGray, index, index);
            }
          })}
        </MapContainer>) : null}
        {this.state.favoritesInfo.length > 0 ? 
          (<List dataSource={this.state.favoritesInfo}
            renderHeader={() => (
              <ListHeader>{this.state.strings.favorite}</ListHeader>)}
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
  onCheckChanged: React.PropTypes.func,
  showStar: React.PropTypes.bool  
}

FavoriteListView.defaultProps = {
  showStar: false,
  onCheckChanged: null
}
