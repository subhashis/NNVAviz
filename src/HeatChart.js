import React, { Component } from 'react';
import * as d3 from 'd3';
import circularHeatChart from './circularHeatChart';
import $ from 'jquery';

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
      .numSegments(this.props.size)
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

    //draw mask
    d3.select('div#mychart2').select('svg')
      .append('path')
      .attr('id','mask')
      .attr('d',d3.arc().innerRadius(50).outerRadius(35*3+50).startAngle(0).endAngle(0))
      .style('opacity','0.3')
      .style('fill','white')

    //draw drop shadow
    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    let svg = d3.select('div#mychart2').select('svg');
    svg.attr('id','heatSvg');
    let filter = svg.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 5)
    .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", -5)
    .attr("dy", -5)
    .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    let feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

    //draw selected group
		d3.select('div#mychart2').select('svg').append('g')
      .attr('id','selectedHeat')
      .attr("transform", "rotate(180) scale(1.25)")
      .style("filter", "url(#drop-shadow)");

    // add the name of chart
    const title = document.createTextNode('Sensitivity Heat Chart');
    $('#mychart2').append(title);
  }
  render() {
    return (
      <div className = "chart border border-primary" id = "mychart2" / >
    );
  }
}

export default HeatChart;
