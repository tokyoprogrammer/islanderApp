import React from 'react';
import ReactDOM from 'react-dom';
import {Navigator, Splitter, SplitterSide, SplitterContent, Page, Button, List, ListItem, Icon} from 'react-onsenui';

import HomePage from './HomePage';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  loadPage(page) {
    this.hide();
    const currentPage = this.navigator.pages.slice(-1)[0] // --- or [this.navigator.pages.length - 1]
    if(currentPage.key != page.name){
      this.navigator.resetPage({ component: page, props: { key: page.name } }, { animation: 'fade' });
    }
  }

  show() {
    this.setState({
      isOpen: true
    });
  }

  hide() {
    this.setState({
      isOpen: false
    });
  }
  
  renderPage(route, navigator) {
    route.props = route.props || {};
    route.props.navigator = navigator;
    route.props.showMenu = this.show.bind(this);

    return React.createElement(route.component, route.props);
  }
  
  render() {
    let imageStyle = {
      width: '40%',
      marginLeft: '30%',
      marginRight: '30%',
      marginBotton: '4%',
      marginTop: '4%'
    };
    let divCenter = {
      textAlign: 'center'
    };
    let imageSmall = {
      marginTop: '5px',
      height: '20px'
    };
    return (
      <Splitter>
        <SplitterSide
          side='left'
          collapse={true}
          isOpen={this.state.isOpen}
          onClose={this.hide.bind(this)}
          swipeable={true}>
          <Page>
             <img src="img/islander.png" 
               className="center" 
               style={imageStyle} />
             <div style={divCenter} >
               <h3>Islander <Icon icon='plane' style={{color: '#00CED1'}}/> </h3>
               <h3>Jeju <img src="img/milgam.png" style={imageSmall} /></h3> 
             </div>
             <List>
              <ListItem key={HomePage.name} onClick={this.loadPage.bind(this, HomePage)} tappable>
                Home
              </ListItem>
            </List>
          </Page>
        </SplitterSide>
        <SplitterContent>
          <Navigator 
            initialRoute={{ component: HomePage, props: { key: HomePage.name } }} 
            renderPage={this.renderPage.bind(this)}
            ref={(navigator) => { this.navigator = navigator; }} />
        </SplitterContent>
      </Splitter>
    );
  }
}
