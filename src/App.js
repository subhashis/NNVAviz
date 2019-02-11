import React, { Component } from 'react';
import './svg.css';
import './style.css';
import OutputCharts from './OutputCharts';
import InputCharts from './inputComponents/InputCharts';
import axios from 'axios';
import data from './data/2/NNVA_data';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data:data,
      previewData: null,
    }
    this.getData = this.getData.bind(this);
  }
  getData(url,para){
    axios.get(url,para)
      .then(res=>{
        console.log(res.data);
        this.setState({previewData: res.data});
      });
  }
  render() {
    return (
      <div className="App">
        <p align="center"><font size="8px" color="#777" fontFamily="Georgia">NNVA: Neural Network Assisted Visual Analysis</font></p>
        <OutputCharts
          data={this.state.data}
         />
        <InputCharts
          previewData={this.state.previewData}
          request = {this.getData}
         />
      </div>
    );
  }
}

export default App;
