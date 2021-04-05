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
import FormControl from'@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

export default class Models extends React.Component {

  constructor(props) {
    super(props);
  
    this.axiosInstance=axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Authorization': 'Bearer ' +this.props.tokens['access_token']
      } 
    });
    this.state = { models: [], new_model : '', brands: [], brand: ''};
    this.setNewModel = this.setNewModel.bind(this);
    this.deleteModel = this.deleteModel.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
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

  setNewModel(e){
    this.setState({new_model:e.target.value});
  }

  componentDidMount(){
    this.loadData();
  }

  async loadData(){
    let response;
    try {
      response = await this.axiosInstance.get('/CarModel');
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
      
    this.setState({models : response.data});

    try {
      response = await this.axiosInstance.get('/CarBrand');
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
    this.setState({brands : response.data});
    
  }

  async addModel(){
    try {
       await this.axiosInstance.post('/CarModel',{name:this.state.new_model, carBrandId:this.state.brand});
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
    this.loadData();
  }

  async deleteModel(id){
    try {
       await this.axiosInstance.delete('/CarModel/'+id);
    } catch (error) {
      this.handleHttpError(error);
      return;
    }
    this.loadData();
  }

  handleBrandChange(brand){
    this.setState({brand:brand});
  }

  isAdmin(){
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
            <TableCell align="right">Model Id</TableCell>
            <TableCell align="right">Brand</TableCell>
            <TableCell align="right">Model</TableCell>
            <TableCell align="right">Delete</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {this.state.models.map((model) => (
            <TableRow key={model['id']}>
              <TableCell align="right">{model['id']}</TableCell>
              <TableCell align="right">{model['carBrand']['name']}</TableCell>
              <TableCell align="right">{model['name']}</TableCell>
              <TableCell align="right">
                  <Button  disabled={!this.isAdmin()}  variant="contained" color="secondary" onClick={()=>this.deleteModel(model['id'])}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
            
      </TableContainer>
      </Grid>
      <Grid item xs={6}>
      <Button disabled={this.state.new_model.length===0 || this.state.brand.length===0 || !this.isAdmin()} variant="contained" color="primary" onClick={()=>this.addModel()}>
        Add Car Model
      </Button>
      </Grid>
      <Grid item xs={6}>
      <TextField disabled={!this.isAdmin()} id="standard-basic" label="New Car Model"  onChange={(e)=>this.setNewModel(e)}/>
      </Grid>

      <Grid item xs={6}>
        <FormControl variant="outlined" style={{minWidth: 200}} size="small">
          <InputLabel disabled={!this.isAdmin()} id="diagram-type-selection" >Select Brand</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.brand}
              onChange={(e)=>this.handleBrandChange(e.target.value)}
              label="Select Brand"
              >
              {this.state.brands.map((brand) => (
                <MenuItem key={brand['id']} value={brand['id']}>{brand['name']}</MenuItem>
              ))}
          </Select>
        </FormControl>
      </Grid>
      </Grid>
    );
  }

}