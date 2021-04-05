import React from 'react';
import { CssBaseline, Toolbar } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Brands from './Brands';
import Models from './Models';
import { BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import axios from 'axios';
//import Link from '@material-ui/core/Link';

export default class MainView extends React.Component {

  constructor(props){
    super(props);
    this.axiosInstance=axios.create({
      baseURL: process.env.REACT_APP_OAUTH_URL,
      headers: {
        'Authorization': 'Bearer '+this.props.tokens['access_token']
      } 
    });
    this.onMenuClick=this.onMenuClick.bind(this);
    this.onMenuClose=this.onMenuClose.bind(this);
    this.onAccountClick=this.onAccountClick.bind(this);
    this.onAccountClose=this.onAccountClose.bind(this);
    this.logoutUser=this.logoutUser.bind(this);
    //this.state={ menu_open : false, target : null};
    this.state={anchorEl:null, anchorEl2:null, name:null, preferred_username:null};
  }

  componentDidMount(){
    this.loadUserData();
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

  async loadUserData(){
    let response;
    try {
      response = await this.axiosInstance.get('/oidc/userinfo');
    } catch (error) {
        this.handleHttpError(error);
        return;
    }
    
    console.log(response.data);
    this.setState({name: response.data['name'],preferred_username:response.data['preferred_username']}); 
  }

  onMenuClick(e){
    //this.setState((state) => ({menu_open : !this.state.menu_open}));
    this.setState({anchorEl: e.target});
  }

  onMenuClose(){
    this.setState({anchorEl: null});
  }

  onAccountClick(e){
    //this.setState((state) => ({menu_open : !this.state.menu_open}));
    this.setState({anchorEl2: e.target});
  }

  onAccountClose(){
    this.setState({anchorEl2: null});
  }

  logoutUser(){
    let url = window.location.href.split('/');
    let domain = url[0]+'//'+url[2];
    window.location.href=process.env.REACT_APP_OAUTH_URL+'/logout?invalidate_tokens=true&target_url='+domain;       
  }

  render(){
     return (
      <div>
        <CssBaseline />
        <AppBar position="static">
            <Toolbar>
            <Box display='flex' flexGrow={1}>
            <IconButton color="inherit"  onClick={(e)=>this.onMenuClick(e)}>
              <MenuIcon />
            </IconButton>
            </Box>
            <IconButton
                color="inherit"
                onClick={(e)=>this.onAccountClick(e)}
              >
                <AccountCircle />
              </IconButton>            
            </Toolbar>
        </AppBar>


        <Menu id="simple-menu"  
          open={Boolean(this.state.anchorEl2)} 
          anchorEl={this.state.anchorEl2}
          anchororigin={{vertical: 'bottom', horizontal: 'right'}}
          transformOrigin={{vertical: 'top', horizontal: 'right'}}
          getContentAnchorEl={null}
          keepMounted
          onClose={this.onAccountClose}
        >
          <Box m={2}>
            <Typography>{this.state.preferred_username}</Typography>
            <Typography variant="subtitle2">{this.state.name}</Typography>
          </Box>
          <Divider />
          <MenuItem  onClick={this.logoutUser}>Logout</MenuItem>
        </Menu>



        <Box m={3}>
        <BrowserRouter>
        <Menu id="simple-menu"  
          open={Boolean(this.state.anchorEl)} 
          anchorEl={this.state.anchorEl}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          transformOrigin={{vertical: 'top', horizontal: 'left'}}
          getContentAnchorEl={null}
          keepMounted
          onClose={this.onMenuClose}
        >
          <MenuItem component={Link} to='/'>Home</MenuItem>
          <MenuItem component={Link} to='/Brands'>Brands</MenuItem>
          <MenuItem component={Link} to='/Models'>Car Models</MenuItem>
        </Menu>


          <Switch>
            <Route path="/" exact><Brands tokens={this.props.tokens}/></Route>
            <Route path="/Brands" exact><Brands tokens={this.props.tokens}/></Route>
            <Route path="/Models" exact><Models tokens={this.props.tokens}/></Route>
          </Switch>
      </BrowserRouter>
      </Box>             
      </div>
     );
  }

}