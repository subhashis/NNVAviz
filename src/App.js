import React, { Component } from 'react';
import OutputCharts from './OutputCharts';
import InputCharts from './inputComponents/InputCharts';
import axios from 'axios';
import data from './data/1/NNVA_data';
import 'react-table/react-table.css'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './svg.css';
import './style.css';

class App extends Component {
  constructor(props){
    super(props);
    let index_name = [];
    for (let i =0;i<35;i++){
      index_name.push('p'+i);
    }
    let para_names = [
      "k_RL",
      "k_RLm",
      "k_Rd0",
      "k_Rs",
      "k_Rd1",
      "k_Ga",
      "k_G1",
      "k_Gd",
      "k_24cm0",
      "k_24cm1",
      "k_24mc",
      "k_24d",
      "k_42a",
      "k_42d",
      "k_B1cm",
      "k_B1mc",
      "k_Cla4a",
      "k_Cla4d",
      "C24_t",
      "B1_t",
      "C42_t",
      "G_t",
      "R_t",
      "q",
      "h",
      "D_R",
      "D_RL",
      "D_G",
      "D_Ga",
      "D_Gbg",
      "D_Gd",
      "D_c24m",
      "D_c42",
      "D_c42a",
      "D_B1m"
    ];
    this.para_names = index_name;
    let marks = [];
    for (let i=0;i<35;i++){
      let mark = {};
      let r=[];
      r.push(data.pset[i]);
      r.push(Math.random()*2-1);
      r.push(Math.random()*2-1);
      mark[r[0]]={
        label: r[0].toFixed(2),
        name: 'Cur',
        style:{
          color: '#ff2b75',
          transform: r[0].transform,
        }
      }
      mark[r[1]]={
        label: r[1].toFixed(2),
        name: 'Max',
        style:{
          color: '#ad7c0c',
          transform: r[0].transform,
        }
      }
      mark[r[2]]={
        label: r[2].toFixed(2),
        name: 'Min',
        style:{
          color: '#2b75ff',
          transform: r[0].transform,
        }
      }
      for (let i in mark){
        mark[i].level = 0;
      }
      for (let i = 0;i<r.length;i++){
        for (let j = i+1;j<r.length;j++){
          if (Math.abs(r[j]-r[i])<0.15){
            mark[r[j]].level = mark[r[i]].level+1;
          } 
        }
      }
      for (let i in mark){
        let tmp = mark[i];
        tmp.style.transform = 'translateX(-80%) rotate(-70deg) translateX(-'+tmp.level*100+'%)';
      }
      marks.push(mark);
    }
    this.state = {
      data:data,
      previewData: null,
      marks: marks,
    }
    this.getData = this.getData.bind(this);
    this.changePreColor = this.changePreColor.bind(this);
  }

  changePreColor(c){
    this.setState({preColor:c})
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
          paraName = {this.para_names}
          data={this.state.data}
          changePreColor = {this.changePreColor}
        />
        <InputCharts
          paraName = {this.para_names}
          previewData={this.state.previewData}
          request = {this.getData}
          marks = {this.state.marks}
          preColor = {this.state.preColor}
          data = {this.state.data}
        />
      </div>
    );
  }
}

export default App;
