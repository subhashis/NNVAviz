import React, { Component } from 'react';
import './svg.css';
import './style.css';
import OutputCharts from './OutputCharts';
import InputCharts from './inputComponents/InputCharts';

class App extends Component {
  render() {
    return (
      <div className="App">
        <p align="center"><font size="8px" color="#777" font-family="Georgia">NNVA: Neural Network Assisted Visual Analysis</font></p>
        <OutputCharts />
        <InputCharts />
      </div>
    );
  }
}

export default App;
