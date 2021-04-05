import React from 'react';
import {  Route, BrowserRouter, Redirect} from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import LinearProgress from '@material-ui/core/LinearProgress';


class Login extends React.Component {

    constructor(props){
        super(props);
        this.state=({code : null});
        this.axiosInstance=axios.create({
            baseURL: process.env.REACT_APP_OAUTH_URL
        });
    }

    componentDidMount(){
        //if the URL contains a param of name code, then we received a code from access manager: means, user did just login and got redirected. Let's store the code in a state variable
        let code = queryString.parse(this.props.location.search).code;
        if (code) this.setState({code : code});
    } 

    componentWillUnmount(){
        //we have completed the login. Let's cleanup
        window.sessionStorage.removeItem('ah33ddd/pathname');
        window.sessionStorage.removeItem('ah33ddd/search');
        this.setState({code: null});
    }

    componentDidUpdate(){
        //only fetch tokens if we received a code to obtain a bearer token and we already cleaned up the URL in the browser to whatever it was before login
        let code = queryString.parse(this.props.location.search).code;
        if (!code && this.state.code ) { //we logged in (=we have a code), and our URL has been cleaned up
            this.getTokens(this.state.code); //final step: Get tokens
        }
    }

    handleHttpError(error){
        
        if (error.response) {
            // Request made and server responded
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.log(error.config);
            console.log('Error', error.message);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
    }

    getDomain(){
        let url = window.location.href.split('/');
        return url[0]+'//'+url[2]+'/';
    }

    async getTokens(code){
        let response;
        try {
          response = await this.axiosInstance.post('/oauth/token', 'grant_type=authorization_code&code='+code+'&client_id='+process.env.REACT_APP_OAUTH_CLIENT_ID+'&redirect_uri='+this.getDomain(), 
            {   
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic '+process.env.REACT_APP_OAUTH_CLIENT_SECRET
                } 
            });
        } catch (error) {
            this.handleHttpError(error);
            this.setState({code : null});
            return;
        }
        
        console.log(response.data);
        this.props.updateTokens(response.data); //this will tell the Authenticate component that we are finally authenticated
        

    }

    render(){
        //if you get here you are unauthenticated. See line 142
        let code = queryString.parse(this.props.location.search).code;
        if (!code && !this.state.code) {  //if we have no code then we need to redirect to the access manager for showing a login page
            //save url for later return after login so that we can continue where we stopped
            window.sessionStorage.setItem('ah33ddd/pathname',this.props.location.pathname); 
            window.sessionStorage.setItem('ah33ddd/search',this.props.location.search); 
            console.log("no code anywhere redirecting to login to come back on "+window.sessionStorage.getItem('ah33ddd/pathname')+window.sessionStorage.getItem('ah33ddd/search')); 
            //redirect to login page as specified by environmental variables
            window.location.href = process.env.REACT_APP_OAUTH_URL+'/oauth/authorize?client_id='+process.env.REACT_APP_OAUTH_CLIENT_ID+'&response_type=code&redirect_uri='+this.getDomain(); 
            return null; 
        }
        if (code && this.state.code)  { //user got just redirected back. First let's get rid of the path param in the url and change back to the original url (before login redirection)
            console.log("I should redirect to: "+window.sessionStorage.getItem('ah33ddd/pathname')+window.sessionStorage.getItem('ah33ddd/search'));
            return (<Redirect to={{
                pathname: window.sessionStorage.getItem('ah33ddd/pathname'),
                search: window.sessionStorage.getItem('ah33ddd/search')
              }} />);
        }
        return( //=!code && this.state.code: Show some fancy loading bar while we get the bearer token
            <LinearProgress />
        );
    }

}


export default class Authenticate extends React.Component {

    constructor(props) {
        super(props);
        this.updateTokens=this.updateTokens.bind(this);
    }

    //authenticated equals we have a token
    isAuthenticated(){
        if (!this.props.tokens) return false;
        return true;
    }


    resetToken(){
        console.log('invalidate token');
        clearTimeout(this.tokenTimer);
        this.props.updateTokens(null);
    }

    updateTokens(tokens){
        this.tokenTimer = setTimeout(() => this.resetToken(),tokens['expires_in']*1000);
        this.props.updateTokens(tokens);
    }


    render(){
       
        //if we are authenticated, then we show the stuff, which is within <Authenticated></Authenticated> in App.js ....
        if (this.isAuthenticated()){
            console.log('We are authenticated');
            return (<div>{this.props.children}</div>);
        }

        //... otherwise we show above Login component. We need to wrap in <BrowserRouter> to get access to props like props.location.search
        return (
            <BrowserRouter>
                <Route  render={(props) => (<Login {...props} updateTokens={this.updateTokens}/>) } />
            </BrowserRouter> 
        );
        
    }
}

