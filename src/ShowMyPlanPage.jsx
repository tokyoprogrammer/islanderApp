import React from 'react';
import ReactDOM from 'react-dom';
import {Page, Toolbar, Icon, ToolbarButton, Button, List, ListItem} from 'react-onsenui';

export default class ShowMyPlan extends React.Component {
  constructor(props) {
    super(props);
  }

  showMenu() {
    this.props.showMenu();
  }

  changeLanguage() {
    let lang = this.props.strings.getLanguage();
    if(lang == 'kr') {
      this.props.strings.setLanguage('en');
      localStorage.setItem('lang', 'en');
    } else {
      this.props.strings.setLanguage('kr');
      localStorage.setItem('lang', 'kr');
    }
    this.setState({});
  }

  renderToolbar() {
    const imgStyle = {
      height: '15px',
      marginTop: '5%'
    };
    
    const imgTag = this.props.strings.getLanguage() == 'kr' ? 
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/english.png" 
         style={{width: "33px"}}/></Button>) :
      (<Button onClick={this.changeLanguage.bind(this)} modifier='quiet'><img src="img/korean.png" 
         style={{width: "33px"}}/></Button>);

    return (
      <Toolbar>
        <div className="left">
          {imgTag}
        </div>
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

  render() {
    return (
      <Page renderToolbar={this.renderToolbar.bind(this)}>
        <div>
          {this.props.strings.showschedule}
        </div>
      </Page>
    );
  }
}
