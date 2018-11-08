import React from 'react';
import ReactDOM from 'react-dom';
import {Card} from 'react-onsenui';

import MultiClamp from 'react-multi-clamp';

import {HomePlanCardStyle} from './Styles';

export default class HomePlanCard extends React.Component {
  constructor(props) {
    super(props);

    const serviceLang = "KorService";
    const contentId = this.props.contentid;
    const serviceKey = process.env.REACT_APP_VISIT_KOREA_API_KEY;
    const fixedContentType = 25;

    this.state = {
      overview: "",
      contentId: contentId,
      title: this.props.title,
      img: this.props.img,
      urlForOverview: "https://api.visitkorea.or.kr/openapi/service/rest/" + serviceLang + 
        "/detailCommon?ServiceKey=" + serviceKey + "&contentTypeId=" + fixedContentType + 
        "&contentId=" + contentId + "&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&" + 
        "firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y"
    };

    let cache = JSON.parse(localStorage.getItem("coursecard" + contentId));
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
        this_.setState({overview: cache.items});
      });

    } else {
      this.setCurrentOverview();
    }
  }

  setCurrentOverview() {
    var this_ = this;
    new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest;
      xhr.onload = function() {
        let ret = this_.readItemsFromResponseText(xhr.responseText);
        if(ret != null && ret.overview != null) {
          this_.setState({overview: ret.overview._text});
          let cache = {
            createdDateTime: new Date(),
            items: ret.overview._text
          };
          let cacheName = "coursecard" + this_.state.contentId;
          localStorage.setItem(cacheName, JSON.stringify(cache));
        }

        resolve(new Response(xhr.responseText, {status: xhr.status}));
      }
      xhr.onerror = function() {
        reject(new TypeError('API Request failed'));
      }
      xhr.open('GET', this_.state.urlForOverview);
      xhr.send(null);
    }).then(function(result) {
    });
  }

  readItemsFromResponseText(responseText) {
    var convert = require('xml-js');
    var options = {compact: true, ignoreComment: true, spaces: 4};
    var xml = convert.xml2js(responseText, options); // convert read responseText xml to js
    if(xml.response.body == null) return null;
    if(xml.response.body.items != null) {
      var items = xml.response.body.items.item;
      return items;
    } else {
      return null;
    }
  }

  onClick(contentId) {
    this.props.onClick(contentId);
  }

  render() {
    const card = HomePlanCardStyle.card;
    return (
      <div className="card" style={card.style} onClick={this.onClick.bind(this, this.props.contentid)}>
        <img src={this.state.img}
          style={card.img.style} />
        <div className="card__title" style={card.title.style}>
          <strong><MultiClamp ellipsis="..." clamp={1}>{this.state.title}</MultiClamp></strong>
        </div>
        <div className="card__content" style={card.content.style}>
          <MultiClamp ellipsis="..." clamp={2}>{this.state.overview}</MultiClamp>
        </div>
      </div>
    );
  }
}

HomePlanCard.propTypes = {
  contentid: React.PropTypes.string,
  img: React.PropTypes.string,
  title: React.PropTypes.string,
  onClick: React.PropTypes.func
}
