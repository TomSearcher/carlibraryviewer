import React from 'react';
import Authenticate from './Authenticate';
import MainView from './MainView';

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.updateTokens = this.updateTokens.bind(this);
    this.state = {tokens : null}
    
  }

  updateTokens(tokens){
    this.setState({tokens : tokens});
  }

  render(){
    return(
      //wrap all into the Authenticate component, which will handle login
      <Authenticate tokens={this.state.tokens} updateTokens={this.updateTokens}>
        <MainView tokens={this.state.tokens}/>
      </Authenticate>
    );
  }
}