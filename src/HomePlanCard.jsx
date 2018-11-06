import React from 'react';
import ReactDOM from 'react-dom';
import {Card} from 'react-onsenui';

import './HomePageCSS';

import {HomePlanCardStyle} from './Styles';

export default class HomePlanCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const card = HomePlanCardStyle.card;
    return (
      <div className="card" style={card.style}>
        <img src="https://tong.visitkorea.or.kr/cms/resource/08/197808_image2_1.jpg"
          style={card.img.style} />
        <div className="card__title" style={card.title.style}>
          <strong>놀멍쉬멍 제주 바다 구경떠나기</strong>
        </div>
        <div className="card__content" style={card.content.style}>
          <div className="line-clamp">
            가장 제주다운 풍경을 만날 수 있는 방법은 차편이나 걸어서 해안도로를 달려보는 것. 대자연의 너른 품에서 바름과 구름, 돌과 나무와 하늘을 길동무 삼아 달리며 심신의 여유와 자유로움을 마음껏 느껴보시길.
          </div>
        </div>
      </div>
    );
  }
} 
