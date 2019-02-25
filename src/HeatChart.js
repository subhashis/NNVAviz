import React, { Component } from 'react';
import * as d3 from 'd3';
import circularHeatChart from './circularHeatChart';
import colorbrewer from 'colorbrewer';

class HeatChart extends Component {

  componentDidMount(){
    // draw heat chart
    const sen_min = this.props.sen_min;
    // const sen_mid_point = this.props.sen_mid_point;
    const sen_max = this.props.sen_max;
    const sen_data = this.props.sen_data;
    const chart = circularHeatChart();
    const width = this.props.size;
    const paletteName = 'PiYG';
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
      .enter().append('svg')
      .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`)
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
      .text('Sen: ')
      .attr('x',-this.props.size/2)
      .attr('y',-this.props.size/2)
      .style('dominant-baseline','hanging');
    
    svg.selectAll('path.heat')
      .on('mouseover', function(d,i){
        svg.select('text')
          .text(`Sen: ${d.value.toFixed(2)}`);
        let classes = this.className.baseVal.split(' ');
        d3.selectAll(`rect.${classes[1]}`)
          .style('fill','yellow')
        
      })
      .on('mouseout',function(d,i){
        let classes = this.className.baseVal.split(' ');
        d3.selectAll(`rect.${classes[1]}#all`)
        .style('fill','black');
        d3.selectAll(`rect.${classes[1]}#partial`)
        .style('fill','red');
      })

      // set up palette
		d3.select("#palette")
      .on("keyup", function() {
        var newPalette = d3.select("#palette").property("value");
        if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
        changePalette(newPalette, '#heatSvg');
      })
      .on("change", function() {
        var newPalette = d3.select("#palette").property("value");
        changePalette(newPalette, '#heatSvg');
      });

    function changePalette(paletteName, heatmapId) {
      const classesNumber = 10;
      var colors = colorbrewer[paletteName][classesNumber];
      colors = colors.slice(0).reverse();
      var colorScale = d3.scaleQuantize()
        .domain([sen_min,sen_max])
        .range(colors);
      var svg = d3.select(heatmapId);
      var t = svg.transition().duration(500);
      t.selectAll("path.heat")
        .style("fill", function(d) {
          if (d != null) return colorScale(d.value);
          else return "url(#diagonalHatch)";
        })
    }


  }
  
  render() {
    return (
      <div className = "chart" id = "mychart2">
        <p align="center">Sensitivity Heat Chart</p>
        Palette:
        <select id="palette" defaultValue='PiYG'>
          <option value="RdYlGn">RdYlGn</option>
          <option value="Spectral">Spectral</option>
          <option value="RdYlBu">RdYlBu</option>
          <option value="RdGy">RdGy</option>
          <option value="RdBu">RdBu</option>
          <option value="PiYG">PiYG</option>
          <option value="PRGn">PRGn</option>
          <option value="BrBG">BrBG</option>
          <option value="PuOr">PuOr</option>
        </select>
      </div>
    );
  }
}

export default HeatChart;
