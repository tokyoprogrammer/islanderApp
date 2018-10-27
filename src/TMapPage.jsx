import React from 'react';
import ReactDOM from 'react-dom';

import {Toolbar, ToolbarButton, Page, Button, BackButton, Icon, ProgressCircular, List, ListItem, ListHeader, Row, Col} from 'react-onsenui';

import postscribe from 'postscribe';

import {ToolbarStyle} from './Styles';

export default class TmapView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      paths: [],
      tmapLatLng: JSON.parse(localStorage.getItem("tmapLatLng"))
    };
    this.fromtotext = this.state.tmapLatLng.prev.title + " -> " + 
      this.state.tmapLatLng.target.title;
  }

  componentDidMount() {
    let block = document.getElementById("tmapscript");
    let childs = block.children;
    if(childs.length > 1) {
      this.loadMap();
      this.setState({loaded: true});
      return;
    }

    postscribe('#tmapscript', 
      "<script src=https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js><\/script>");

    const scripts = [  
      "<script src = https://api2.sktelecom.com/tmap/js?version=1&format=javascript&" + 
      "appKey=" + process.env.REACT_APP_TMAP_API_KEY + "><\/script>"
    ];

    let this_ = this;
    for(let i = 0; i < scripts.length; i++) {
      postscribe('#tmapscript', scripts[i], {
        done: function() {
          this_.loadMap();
          this_.setState({loaded: true});
        }
      });
    }
  }
  
  loadMap() {
    let this_ = this;

    let map = new Tmap.Map({
      div : 'map_div', // map을 표시해줄 div
      width : "100%", // map의 width 설정
      height : "50%", // map의 height 설정
    });
    let tmapLatLng = this.state.tmapLatLng;
           
    map.setCenter(new Tmap.LonLat(
      "126.9850380932383", "37.566567545861645").transform("EPSG:4326", "EPSG:3857"), 15);
       //설정한 좌표를 "EPSG:3857"로 좌표변환한 좌표값으로 즁심점으로 설정합니다.
     
    let routeLayer = new Tmap.Layer.Vector("route");//벡터 레이어 생성
    let markerLayer = new Tmap.Layer.Markers("start");// 마커 레이어 생성
    map.addLayer(routeLayer);//map에 벡터 레이어 추가
    map.addLayer(markerLayer);//map에 마커 레이어 추가
  
    // 시작
    let size = new Tmap.Size(24, 38);//아이콘 크기 설정
    let offset = new Tmap.Pixel(-(size.w / 2), -size.h);//아이콘 중심점 설정
    let icon1 = new Tmap.IconHtml(
      '<img src=http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_s.png />', size, offset)
    //마커 아이콘 설정
    let marker_s = new Tmap.Marker(new Tmap.LonLat(
      "126.9850380932383", "37.566567545861645").transform("EPSG:4326", "EPSG:3857"), icon1);
    //설정한 좌표를 "EPSG:3857"로 좌표변환한 좌표값으로 설정합니다.
    markerLayer.addMarker(marker_s);//마커 레이어에 마커 추가
  
    // 도착
    let icon2 = new Tmap.IconHtml(
      '<img src=http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png />', size, offset);
    //마커 아이콘 설정
    let marker_e = new Tmap.Marker(new Tmap.LonLat(
      "127.10331814639885", "37.403049076341794").transform("EPSG:4326", "EPSG:3857"), icon2);
    //설정한 좌표를 "EPSG:3857"로 좌표변환한 좌표값으로 설정합니다.
    markerLayer.addMarker(marker_e);//마커 레이어에 마커 추가
  
    let headers = {}; 
    headers["appKey"] = process.env.REACT_APP_TMAP_API_KEY;
    //실행을 위한 키 입니다. 발급받으신 AppKey를 입력하세요.
    $.ajax({
      method:"POST",
      headers : headers,
      url:"https://api2.sktelecom.com/tmap/routes?version=1&format=xml",
      //자동차 경로안내 api 요청 url입니다.
      async:false,
      data:{
        //출발지 위경도 좌표입니다.
        startX : tmapLatLng.prev.lng,
        startY : tmapLatLng.prev.lat,
        //목적지 위경도 좌표입니다.
        endX : tmapLatLng.target.lng,
        endY : tmapLatLng.target.lat,
        //출발지, 경유지, 목적지 좌표계 유형을 지정합니다.
        reqCoordType : "WGS84GEO",
        resCoordType : "EPSG3857",
        //각도입니다.
        angle : "172",
        //경로 탐색 옵션 입니다.
        searchOption : 0,
        //교통정보 포함 옵션입니다.
        trafficInfo : "Y"
      },
      //데이터 로드가 성공적으로 완료되었을 때 발생하는 함수입니다.
      success: function(response) {
        let prtcl = response;
        // 결과 출력
        let innerHtml ="";
        let prtclString = new XMLSerializer().serializeToString(prtcl);//xml to String	
        let xmlDoc = $.parseXML( prtclString ),
        $xml = $( xmlDoc ),
        $intRate = $xml.find("Document");

        let tDistance = "총 거리 : " + 
          ($intRate[0].getElementsByTagName("tmap:totalDistance")[0].
          childNodes[0].nodeValue/1000).toFixed(1)+"km,";
        let tTime = " 총 시간 : " + 
          ($intRate[0].getElementsByTagName("tmap:totalTime")[0].
          childNodes[0].nodeValue/60).toFixed(0)+"분,";
//        let tFare = " 총 요금 : " + 
//          $intRate[0].getElementsByTagName("tmap:totalFare")[0].childNodes[0].nodeValue+"원,";
        let taxiFare = " 예상 택시 요금 : " + 
          $intRate[0].getElementsByTagName("tmap:taxiFare")[0].childNodes[0].nodeValue+"원";

        $("#result").text(tDistance+tTime+taxiFare);
  
        routeLayer.removeAllFeatures();//레이어의 모든 도형을 지웁니다.

        let places = $intRate[0].getElementsByTagName("Placemark");
        let paths = [];
        for(let i = 0; i < places.length; i++) {
          let turnType = places[i].getElementsByTagName("tmap:turnType");
          if(turnType.length > 0) turnType = turnType[0].childNodes[0].nodeValue;
          else turnType = 11;
          let placeDesc = places[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
          paths.push(turnType + ":" + placeDesc);
        }
  		
        let traffic = $intRate[0].getElementsByTagName("traffic")[0];
        //교통정보가 포함되어 있으면 교통정보를 포함한 경로를 그려주고
        //교통정보가 없다면  교통정보를 제외한 경로를 그려줍니다.
        if(!traffic){
          // 시작
          let size = new Tmap.Size(24, 38);
          //아이콘 크기 설정
          let offset = new Tmap.Pixel(-(size.w / 2), -size.h);
          //아이콘 중심점 설정
          let icon1 = new Tmap.IconHtml(
            "< img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_s.png' / >", size, offset);
          //마커 아이콘 설정
          marker_s = new Tmap.Marker(new Tmap.LonLat(
            "126.9850380932383", "37.566567545861645").transform("EPSG:4326", "EPSG:3857"), icon1);
          //설정한 좌표를 "EPSG:3857"로 좌표변환한 좌표값으로 설정합니다.
          markerLayer.addMarker(marker_s);
          //마커 레이어에 마커 추가
  
          // 도착
          let icon2 = new Tmap.IconHtml(
            "< img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png' / >", size, offset);
          marker_e = new Tmap.Marker(new Tmap.LonLat(
            "127.10331814639885", "37.403049076341794").transform("EPSG:4326", "EPSG:3857"), icon2);
          markerLayer.addMarker(marker_e);
  
          let prtclLine = new Tmap.Format.KML({extractStyles:true, extractAttributes:true}).read(prtcl);
          //데이터(prtcl)를 읽고, 벡터 도형(feature) 목록을 리턴합니다.
  
          //표준 데이터 포맷인 KML을 Read/Write 하는 클래스 입니다.
          //벡터 도형(Feature)이 추가되기 직전에 이벤트가 발생합니다.
          routeLayer.events.register("beforefeatureadded", routeLayer, onBeforeFeatureAdded);
          function onBeforeFeatureAdded(e) {
            let style = {};
            switch (e.feature.attributes.styleUrl) {
            case "#pointStyle":
              style.externalGraphic = "http://topopen.tmap.co.kr/imgs/point.png"; 
              //렌더링 포인트에 사용될 외부 이미지 파일의 url입니다.
              style.graphicHeight = 16; 
              //외부 이미지 파일의 크기 설정을 위한 픽셀 높이입니다.
              style.graphicOpacity = 1; 
              //외부 이미지 파일의 투명도 (0-1)입니다.
              style.graphicWidth = 16; //외부 이미지 파일의 크기 설정을 위한 픽셀 폭입니다.
              break;
            default:
              style.strokeColor = "#ff0000";//stroke에 적용될 16진수 color
              style.strokeOpacity = "1";//stroke의 투명도(0~1)
              style.strokeWidth = "5";//stroke의 넓이(pixel 단위)
            };
            e.feature.style = style;
          }
  
          routeLayer.addFeatures(prtclLine); //레이어에 도형을 등록합니다.
        } else {
          //기존 출발,도착지 마커릉 지웁니다.
          markerLayer.removeMarker(marker_s); 
          markerLayer.removeMarker(marker_e);
          routeLayer.removeAllFeatures();//레이어의 모든 도형을 지웁니다.
          let trafficColors = {
            extractStyles:true,
            /* 실제 교통정보가 표출되면 아래와 같은 Color로 Line이 생성됩니다. */
            trafficDefaultColor:"#000000", //Default
            trafficType1Color:"#009900", //원할
            trafficType2Color:"#8E8111", //지체
            trafficType3Color:"#FF0000", //정체				
          };    
          let kmlForm = new Tmap.Format.KML(trafficColors).readTraffic(prtcl);
          routeLayer = new Tmap.Layer.Vector("vectorLayerID"); //백터 레이어 생성
          routeLayer.addFeatures(kmlForm); //교통정보를 백터 레이어에 추가   
      		
          map.addLayer(routeLayer); // 지도에 백터 레이어 추가
        }
      	
        map.zoomToExtent(routeLayer.getDataExtent());
        //map의 zoom을 routeLayer의 영역에 맞게 변경합니다.
        this_.setState({paths: paths});
      },
      //요청 실패시 콘솔창에서 에러 내용을 확인할 수 있습니다.
      error:function(request,status,error){
        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      }
    });
  }
 
  showMenu() {
    this.props.showMenu();
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

  renderRow(row, index) {
    let direction = row.split(":")[0];
    let desc = row.split(":")[1];
    let directionIcon = "img/directions/" + direction + ".png"
    return (
      <ListItem key={"details-" + index}>
        <Row style={{marginTop: "8px", marginBottom: "8px"}}>
          <Col width="15%">
            <img src={directionIcon} style={{width: "30px", height: "30px"}} />
          </Col>
          <Col width="85%">
            {desc}
          </Col>
        </Row>
      </ListItem>
    );
  }

  render() {
    return (
      <Page renderToolbar = {this.renderToolbar.bind(this)}>
        {this.state.loaded ? null : (
          <div style={{textAlign: "center", margin: "3%"}}>
            <label>Loading... </label>
            <ProgressCircular indeterminate />
          </div>
        )}
        <b style={{margin: "3%"}}>{this.fromtotext}</b>
        <p id="result" style={{marginLeft: "3%", marginRight: "3%", marginBottom: "2%"}}></p>
        <div id="map_div">
        </div>
        <List dataSource = {this.state.paths} 
          renderRow={this.renderRow.bind(this)} 
          renderHeader={() => <ListHeader>Details</ListHeader>}/>
      </Page>
    );
  } 
}
