import React, { Component } from 'react';
import * as d3 from 'd3';
import circularHeatChart from './circularHeatChart';
import colorbrewer from 'colorbrewer';

class HeatChart extends Component {

  componentDidMount(){
    // draw heat chart
    // const sen_min = this.props.sen_min;
    // const sen_mid_point = this.props.sen_mid_point;
    // const sen_max = this.props.sen_max;
    const sen_data = this.props.sen_data;
    const chart = circularHeatChart();
    const width = this.props.size;
    const paletteName = 'RdYlBu';
    let colors = colorbrewer[paletteName][10];
    colors = colors.slice(0).reverse();

    chart.segmentHeight(3)
      .innerRadius(50)
      .numSegments(this.props.size)
      .range(colors)
      .accessor(accessorFun)
      .radialLabels(null)
      .segmentLabels(null);
    d3.select('#mychart2')
      .selectAll('svg')
      .data([sen_data])
      .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`)
      .attr("class", "heat")
      .call(chart);

    function accessorFun(d){
      return d.value;
    }

    const svg = d3.select('#mychart2').select('svg')
    //draw mask
    svg.append('path')
      .attr('id','mask')
      .attr('d',d3.arc().innerRadius(50).outerRadius(35*3+50).startAngle(0).endAngle(0))
      .style('opacity','0.3')
      .style('fill','white')

    //draw drop shadow
    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
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
		svg.append('g')
      .attr('id','selectedHeat')
      .attr("transform", "rotate(180) scale(1.1)")
      .style("filter", "url(#drop-shadow)");

    // selected value on the cornor
    svg.append('text')
      .text('')
      // .text(this.props.paraName[0])
      .attr('id','P')
      .attr('x',0)
      .attr('y',-2)
      .style('text-anchor','middle')
      .style('dominant-baseline','baseline');
    
    svg.append('text')
      .text('')
      .attr('id','senValue')
      .attr('x',0)
      .attr('y',2)
      .style('text-anchor','middle')
      .style('dominant-baseline','hanging');
    
    const partColor = d3.selectAll(`rect#partial`).attr('fill')
    const allColor = d3.selectAll(`rect#all`).attr('fill')
    const paraName = this.props.paraName;
    svg.selectAll('path.heat')
      .on('mouseover', function(d,i){
        svg.select('#senValue')
          .text(`${d.value.toFixed(2)}`);
        const index = parseInt(this.getAttribute("class").split(' ')[1].slice(1));
        svg.select('#P')
          .text(`${paraName[index]}`);
        let classes = this.className.baseVal.split(' ');
        d3.selectAll(`rect.${classes[1]}`)
          .style('fill','yellow')
        
      })
      .on('mouseout',function(d,i){
        let classes = this.className.baseVal.split(' ');
        d3.selectAll(`rect.${classes[1]}#all`)
          .style('fill',allColor);
        d3.selectAll(`rect.${classes[1]}#partial`)
          .style('fill',partColor);
        svg.select('#senValue')
          .text(``);
        svg.select('#P')
          .text(``);
      })
  }
  
  render() {
    return (
      <div className = "block" id = "mychart2">
        <div style={{width:'50%',float:"left"}}>
          <p align="center" style={{width:'100%',float:"left"}}>Sensitivity Heat Chart</p>
          <svg ></svg>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default HeatChart;
