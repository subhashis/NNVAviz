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
    // const width = this.props.size;
    const paletteName = 'RdYlBu';
    var colors = colorbrewer[paletteName][11];
    colors = colors.slice(0).reverse();

    chart.segmentHeight(3)
      .innerRadius(50)
      .numSegments(this.props.size)
      .range(colors)
      .accessor(accessorFun)
      .radialLabels(null)
      .segmentLabels(null);
    d3.select('#mychart2')
      .select('svg#heatSvg')
      .data([sen_data])
      .attr("viewBox", `-200 -200 400 399`)
      .attr("class", "heat")
      .call(chart);

    function accessorFun(d){
      return d.value;
    }

    const svg = d3.select('#mychart2').select('svg#heatSvg')
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
    const legendSvg = d3.select('#mychart2').select('svg#legend')
    legendSvg.style('width','100%')
      .attr("viewBox", `0 3 70 12`)
      .style('padding-left','14.4%')
      .style('padding-right','14.4%')
    
    let legD = [];
    for (let i = 0; i < 11; i++) {
      legD.push(sen_min+ i * (sen_max-sen_min) / 10)
    }
    this.colorScale = d3.scaleLinear().domain(legD).range(colors)
    let textD = [];
    for (let i = 0; i < 5; i++) {
      textD.push(sen_min+ i * (sen_max-sen_min) / 4)
    }
    let gradientData = [];
    for (let i=0;i<11;i++){
      let tmp ={};
      tmp.offset = (i*10)+'%';
      tmp.color = this.colorScale.range()[i];
      gradientData.push(tmp);
    }
    let gradient = legendSvg.append("linearGradient")
      .attr("id", "heatGradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%")
      .selectAll("stop")
      .data(gradientData)
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    var legend = legendSvg.append("g")
      .attr("class", "legend")
      .selectAll(".legendElement")
      .data(textD)
      .enter().append("g")
      .attr("class", "legendElement");

    this.legend = legend;

    const legendElementWidth = 60 / 4;
    const cellSize = 5;

    legendSvg.append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("class", "cellLegend bordered")
      .attr("width", 60)
      .attr("height", cellSize)
      .style("fill", "url(#heatGradient)");

    legend.append("text")
      .attr("class", "mono legendElement")
      .text(function (d) {
        return d.toFixed(0);
      })
      .style('font-size', '0.12vw')
      .attr("x", function (d, i) {
        return 5 + legendElementWidth * i;
      })
      .attr("y", 5 + cellSize +1)
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'hanging');

    // change colormap
    const changePalette = paletteName => {
      const classesNumber = 11;
      var colors;
      if(paletteName==="seqGreen" || paletteName==="seqOrange" || paletteName==="seqPurple"){
        switch(paletteName){
          case "seqGreen":
            colors = colorbrewer["PRGn"][classesNumber];
            colors = colors.slice(0);
            break;
          case "seqOrange":
            colors = colorbrewer["PuOr"][classesNumber];
            colors = colors.slice(0).reverse();
            break;
          case "seqPurple":
            colors = colorbrewer["PRGn"][classesNumber];
            colors = colors.slice(0).reverse();
            break;
          default:
            break;
        }
        colors = colors.slice(5);
        for (let i =0 ;i<10;i+=2){
          colors.splice(i+1,0,d3.interpolateRgb(colors[i],colors[i+1])(0.5));
        }
      }else{
        colors = colorbrewer[paletteName][classesNumber];
        colors = colors.slice(0).reverse();
      }
      this.colorScale.range(colors);

      //legend
      let gradientData = [];
      for (let i=0;i<11;i++){
        let tmp ={};
        tmp.offset = (i*10)+'%';
        tmp.color = this.colorScale.range()[i];
        gradientData.push(tmp);
      }
      gradient.data(gradientData)
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

      //heat map
      let heatcolorScale = d3.scaleLinear()
        .domain(legD)
        .range(colors);
      d3.select('#heatSvg').selectAll("path.heat")
        .style("fill", function (d) {
          if (d != null) return heatcolorScale(d.value);
          else return "url(#diagonalHatch)";
        })
    };

    d3.select("#heatColorMap")
      .on("keyup", function () {
        var newPalette = d3.select("#heatColorMap").property("value");
        if (newPalette != null) // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
          changePalette(newPalette);
      })
      .on("change", function () {
        var newPalette = d3.select("#heatColorMap").property("value");
        changePalette(newPalette);
      });
  }
  
  render() {
    return (
      <div className = "block" id = "mychart2">
        <div style={{width:'50%',float:"left"}}>
          <p align="center" className='title' style={{width:'100%',float:"left"}}>Parameter Sensitivity View</p>
          <div>
            <svg id="heatSvg"></svg>
            <div style={{fontSize:'0.8vw',textAlign:'center'}}>
              Palette:&nbsp;
              <select id="heatColorMap" defaultValue='RdYlBu'>
                <option value="RdYlGn">RdYlGn</option>
                <option value="Spectral">Spectral</option>
                <option value="RdYlBu">RdYlBu</option>
                <option value="RdGy">RdGy</option>
                <option value="RdBu">RdBu</option>
                <option value="PiYG">PiYG</option>
                <option value="PRGn">PRGn</option>
                <option value="BrBG">BrBG</option>
                <option value="PuOr">PuOr</option>
                <option value="seqPurple">seqPurple</option>
                <option value="seqGreen">seqGreen</option>
                <option value="seqOrange">seqOrange</option>
              </select>
              <svg id='legend'></svg>
            </div>
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default HeatChart;
