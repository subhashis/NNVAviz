import React, { Component } from 'react';
import './svg.css';
import './style.css';
import OutputCharts from './OutputCharts';
import InputCharts from './inputComponents/InputCharts';
import axios from 'axios';
import data from './data/1/NNVA_data';

class App extends Component {
  constructor(props){
    super(props);
    // console.log(data);
    let marks = [];
    for (let i=0;i<35;i++){
      let mark = {};
      mark[data.pset[i]]={
        label: data.pset[i].toFixed(2),
        style:{
          color: '#ff2b75',
        }
      }
      marks.push(mark);
    }
    this.state = {
      data:data,
      previewData: null,
      marks: marks,
    }
    // console.log(marks);
    this.getData = this.getData.bind(this);
  }

  getData(url,para){
    axios.get(url,{
      params: para,
    })
      .then(res=>{
        // console.log(res.data);
        this.setState({previewData: res.data});
      });
  }

  updateMarks(){
    ;
  }

  render() {
    return (
      <div className="App">
        {/* <p align="center"><font size="8px" color="#777" fontFamily="Georgia">NNVA: Neural Network Assisted Visual Analysis</font></p> */}
        <OutputCharts
          data={this.state.data}
        />
        <InputCharts
          previewData={this.state.previewData}
          request = {this.getData}
          marks = {this.state.marks}
        />
      </div>
    );
  }
}

export default App;
