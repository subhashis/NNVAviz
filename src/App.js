import React, { Component } from 'react';
import './svg.css';
import './style.css';
import OutputCharts from './OutputCharts';

class App extends Component {
  render() {
    return (
      <div className="App">
        <OutputCharts />
        <div id="inputs">
          <div id='protein'></div>
          <div id='save'></div>
        </div>
      </div>
    );
  }
}

export default App;
