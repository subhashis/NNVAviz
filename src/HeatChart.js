import React, { Component } from 'react';
import data from './data/1/NNVA_data';
import * as d3 from 'd3';
import circularHeatChart from './circularHeatChart';

class HeatChart extends Component {

  constructor(props){
    super(props);
    // prepare sensitivity
    this.sen_data = [];
    this.sen_max = data.sensitivity[0] * 100000;
    this.sen_min = data.sensitivity[0] * 100000;

    for (var i = 0; i < 400 * 35; i++) {
      this.sen_data[i] = {
        title: "Segment " + i,
        value: Math.round((data.sensitivity[i] * 100000))
      };
      if (data.sensitivity[i] * 100000 > this.sen_max)
        this.sen_max = data.sensitivity[i] * 100000;
      if (data.sensitivity[i] * 100000 < this.sen_min)
        this.sen_min = data.sensitivity[i] * 100000;
    }

    this.sen_mid_point = (this.sen_max + this.sen_min) / 2;
    // console.log('sensivity bounds:');
    // console.log(sen_max);
    // console.log(sen_min);
    // console.log('sensitivity data:')
    // console.log(sen_data);
  }
  componentDidMount(){
    // draw heat chart
    const sen_min = this.sen_min;
    const sen_mid_point = this.sen_mid_point;
    const sen_max = this.sen_max;
    const sen_data = this.sen_data;
    const chart = circularHeatChart();
    const width = this.props.size;

    chart.segmentHeight(3)
      .innerRadius(50)
      .numSegments(400)
      .domain([Math.round(sen_min), Math.round(sen_mid_point), Math.round(sen_max)])
      .range(["#276419", "#e6f5d0", "#c51b7d"])
      .radialLabels(null)
      .segmentLabels(null)
      .margin({
        top: 42,
        right: 50,
        bottom: 50,
        left: 50
      })
      .accessor(function (d) {
        return d.value;
      })
      .radialLabels(null)
      .segmentLabels(null);
    d3.select('#mychart2')
      .selectAll('svg')
      .data([sen_data])
      .enter().append('svg')
      .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`)
      .call(chart);
  }
  render() {
    return (
      <div className = "chart" id = "mychart2" / >
    );
  }
}

export default HeatChart;
