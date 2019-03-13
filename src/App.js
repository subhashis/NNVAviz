import React, { Component } from 'react';
import OutputCharts from './OutputCharts';
import InputCharts from './inputComponents/InputCharts';
import MaxtrixView from './MatrixView';
import axios from 'axios';
import data from './data/1/NNVA_data';
import 'react-table/react-table.css'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './style.css';
import act_max from './data/optimizer_data/NNVA_act_max';
import act_min from './data/optimizer_data/NNVA_act_min';
import act_max_min from './data/optimizer_data/NNVA_act_max_min';

class App extends Component {
  constructor(props){
    super(props);
    // let index_name = [];
    // for (let i =0;i<35;i++){
    //   index_name.push('p'+i);
    // }
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
    this.para_names = para_names;
    let marks = [];
    for (let i = 0;i<35;i++){
      let mark = {}
      const datum = data.pset[i]
      mark[datum]={
        label: datum.toFixed(2),
        name: 'Cur',
        style:{
          color: 'black'
        }
      }

      // const test = Math.random()
      
      // mark[test]={
      //   label: test.toFixed(2),
      //   name: 'Max',
      //   style:{
      //     color: '#cc0000',
      //   }
      // }
      // mark[r[2]]={
      //   label: r[2].toFixed(2),
      //   name: 'Min',
      //   style:{
      //     color: '#3333ff',
      //   }
      // }
      marks.push(mark)
    }
    this.sortMarks(marks)

    this.state = {
      data:data,
      previewData: null,
      marks: marks,
    }
    this.getData = this.getData.bind(this);
    this.changePreColor = this.changePreColor.bind(this);
    this.updateMarks = this.updateMarks.bind(this)
  }

  sortMarks(marks){
    for (let i=0;i<35;i++){
      let mark = marks[i];
      let keys = Object.keys(mark)
      for (let i in mark){
        mark[i].level = 0;
      }
      for (let i=0;i<keys.length;i++){
        for (let j = i+1;j<keys.length;j++){
          let diff = Math.abs(keys[j]-keys[i])
          if (diff<0.15){
            mark[keys[j]].level = mark[keys[i]].level+1;
          } 
        }
      }
      for (let i in mark){
        mark[i].style.transform = 'translateX(-80%) rotate(-70deg) translateX(-'+mark[i].level*100+'%)';
      }
    }
  }

  changePreColor(c){
    this.setState({preColor:c})
  }

  getData(url,para){
    axios.get(url,{
      params: para,
    })
      .then(res=>{
        this.setState({previewData: res.data});
      });
  }

  updateMarks(start,end,type){
    let act,color;
    if(type==='Max') {
      act = act_max.act_max;
      color = '#cc0000'
    }
    else if (type === 'Min'){
      act = act_min.act_min;
      color = '#3333ff'
    } 
    else if (type === 'Com') {
      act = act_max_min.act_max_min;
      color = '#801a80'
    }
    let line = act[start*10+end]
    let act_data = line[2]
    let marks = this.state.marks.slice(0)
    for (let i = 0;i<35;i++){
      let mark = marks[i]
      for (const key in mark){
        if (mark[key].name === type)
          delete mark[key]
      }
      const datum = act_data[i]
      mark[datum]={
        label: datum.toFixed(2),
        name: type,
        style:{
          color: color,
        }
      }
    }
    this.sortMarks(marks)
    this.setState({marks:marks})
  }

  render() {
    return (
      <div className="App">
        {/* <p align="center"><font size="8px" color="#777" fontFamily="Georgia">NNVA: Neural Network Assisted Visual Analysis</font></p> */}
        <OutputCharts
          paraName = {this.para_names}
          data={this.state.data}
          changePreColor = {this.changePreColor}
          updateMarks = {this.updateMarks}
        />
        <InputCharts
          paraName = {this.para_names}
          previewData={this.state.previewData}
          request = {this.getData}
          marks = {this.state.marks}
          preColor = {this.state.preColor}
          data = {this.state.data}
        />
        <MaxtrixView
          paraName = {this.para_names}
         />
      </div>
    );
  }
}

export default App;
