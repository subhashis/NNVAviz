import React, { Component } from 'react';
import * as d3 from 'd3';
import circularHeatChart from './circularHeatChart';

class HeatChart extends Component {

  componentDidMount(){
    // draw heat chart
    const sen_min = this.props.sen_min;
    const sen_mid_point = this.props.sen_mid_point;
    const sen_max = this.props.sen_max;
    const sen_data = this.props.sen_data;
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
