import React from 'react';
import axios from "axios";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';


export default class Brands extends React.Component {

  constructor(props) {
    super(props);
  
    this.axiosInstance=axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Authorization': 'Bearer ' +this.props.tokens['access_token']
      } 
    });
    this.state = { brands: [], new_brand : ''};
    this.setNewBrand = this.setNewBrand.bind(this);
    this.deleteBrand = this.deleteBrand.bind(this);
  }

  handleHttpError(error){
    console.log(error.config);
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

  setNewBrand(e){
    this.setState({new_brand:e.target.value});
  }

  componentDidMount(){
    this.loadData();
  }

  async loadData(){
    let response;
    try {
      response = await this.axiosInstance.get('/CarBrand');
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
      
    this.setState({brands : response.data});
  }

  async addBrand(){
    try {
       await this.axiosInstance.post('/CarBrand',{name:this.state.new_brand});
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
    this.loadData();
  }

  async deleteBrand(id){
    try {
       await this.axiosInstance.delete('/CarBrand/'+id);
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
    this.loadData();
  }

  isAdmin(){
    //just return true in case you want to check if the API gateway actually rejects unauthorized users
    //return true; 
    return this.props.tokens['scope'].indexOf(' write') !== -1;
  }

  render(){

     return (
       <Grid container direction='column' spacing={3}>
         <Grid item xs={12}>
      <TableContainer component={Paper}>
         <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right">Brand Id</TableCell>
            <TableCell align="right">Brand</TableCell>
            <TableCell align="right">Delete</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {this.state.brands.map((brand) => (
            <TableRow key={brand['id']}>
              <TableCell align="right">{brand['id']}</TableCell>
              <TableCell align="right">{brand['name']}</TableCell>
              <TableCell align="right">
                  <Button  disabled={!this.isAdmin()} variant="contained" color="secondary" onClick={()=>this.deleteBrand(brand['id'])}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
            
      </TableContainer>
      </Grid>
      <Grid item xs={6}>
      <Button disabled={this.state.new_brand.length===0 || !this.isAdmin()} variant="contained" color="primary" onClick={()=>this.addBrand()}>
        Add Brand
      </Button>
      </Grid>
      <Grid item xs={6}>
      <TextField  disabled={!this.isAdmin()} id="standard-basic" label="New Brand"  onChange={(e)=>this.setNewBrand(e)}/>
      </Grid>
      </Grid>
    );
  }

}