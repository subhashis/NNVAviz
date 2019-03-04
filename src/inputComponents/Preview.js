import React, { Component } from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';

export default class Preview extends Component {
    constructor(props){
      super(props);
      this.state={
        diff : false,
      }
  
      // prepare radial axes data
      const valueLen = this.props.valueLen;

      const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 
      // const uncertainty_scale = 500; //to keep uncertainty bands in scale
      let my_points = [];
      for (let i = 0; i < valueLen; i += 1) {
        var angle = dummy_data[i];
        var protein_value = 0;
        var std = 0;
        let tmp = {
          'angle': angle,
          'std': std,
          'value': protein_value
        };
        my_points.push(tmp);
      }
      my_points.push(my_points[0]);
      this.my_points = my_points;
  
      // prepare generator
      const radius = this.props.radius;
      this.radialAreaGenerator1 = d3.radialArea()
        .curve(d3.curveCardinalClosed)
        .angle(function (d) {
          return d.angle;
        })
        .innerRadius(function (d) {
          return radius - 200 * d.std;
        })
        .outerRadius(function (d) {
          return radius + 200 * d.std;
        });
  
      this.radialAreaGenerator2 = d3.radialArea()
        .curve(d3.curveCardinalClosed)
        .angle(function (d) {
          return d.angle;
        })
        .innerRadius(function (d) {
          return radius - 400 * d.std;
        })
        .outerRadius(function (d) {
          return radius + 400 * d.std;
      });
  
    }

    componentDidUpdate(){
      this.colorScale = this.props.preColor;
      if (!this.colorScale){
        let colors = colorbrewer['PiYG'][11];
        colors = colors.slice(0).reverse();
        this.colorScale = d3.scaleQuantize().domain([0.0, 400]).range(colors);
      }
      // calculate the value scale
      if (this.props.previewData){
        this.minValue = Math.min(...this.props.previewData.curve_mean);
        this.maxValue = Math.max(...this.props.previewData.curve_mean);

        const data = this.props.previewData;
        const valueLen = this.props.valueLen;
        const ori = this.props.data;
        const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 
        const uncertainty_scale = 500; //to keep uncertainty bands in scale
        let my_points = [];
        let colorScale = this.colorScale;
        
        
        
        // normal
        if(!this.state.diff){
          for (let i = 0; i < valueLen; i += 1) {
            var angle = dummy_data[i];
            var protein_value = data.curve_mean[i];
            var std = data.curve_std[((i + valueLen/2) % valueLen)] / uncertainty_scale;
            let tmp = {
              'angle': angle,
              'std': std,
              'value': protein_value
            };
            my_points.push(tmp);
          }
          my_points.push(my_points[0]);
          this.my_points = my_points;
          //draw the std2
          let pathData2 = this.radialAreaGenerator2(this.my_points);
    
          d3.select("#previewChart")
            .select('path.std2')
            .attr('d', pathData2)
            .style('visibility','visible');
      
          // draw the std1
          let pathData1 = this.radialAreaGenerator1(this.my_points);
      
          d3.select("#previewChart")
            .select('path.std1')
            .attr('d', pathData1)
            .style('visibility','visible');
        }
        // showing diff
        else {
          let minValue = Infinity;
          let maxValue = -Infinity;
          for (let i = 0; i < valueLen; i += 1) {
            let angle = dummy_data[i];
            let protein_value = Math.abs(data.curve_mean[i]-ori.curve_mean[i]);
            if (protein_value>maxValue) maxValue = protein_value;
            if (protein_value<minValue) minValue = protein_value;
            let std = data.curve_std[((i + valueLen/2) % valueLen)] / uncertainty_scale;
            let tmp = {
              'angle': angle,
              'std': std,
              'value': protein_value
            };
            my_points.push(tmp);
          }
          my_points.push(my_points[0]);
          this.my_points = my_points;
          let tmpC = d3.scaleQuantize();
          tmpC.range(colorScale.range());
          tmpC.domain([minValue,maxValue]);
          colorScale = tmpC;
          // hide stds
          //draw the std2
          let pathData2 = this.radialAreaGenerator2(this.my_points);
    
          d3.select("#previewChart")
            .select('path.std2')
            .attr('d', pathData2)
            .style('visibility','hidden');
      
          // draw the std1
          let pathData1 = this.radialAreaGenerator1(this.my_points);
      
          d3.select("#previewChart")
            .select('path.std1')
            .attr('d', pathData1)
            .style('visibility','hidden');
        }

    
        // draw the value (marker)
        var protein_markers = d3.select("#previewChart")
          .select("g.protein_markers");
        var sel = protein_markers.selectAll("path").data(my_points);
        sel.attr("fill", (d, i)=>{
            return colorScale(d.value)
          })
      }
    }
    
    componentDidMount() {
        const width = this.props.size;
        const radius = this.props.radius;
    
        // create svg
        d3.select("#previewChart").append("svg")
          .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`);
    
        // draw radial axes
        this.draw_radial_axes();
    
        //draw the std2
        var pathData2 = this.radialAreaGenerator2(this.my_points);
    
        d3.select("#previewChart").select("svg")
          .append("g")
          .append('path')
          .attr("class", "std2")
          .attr('d', pathData2);
    
        // draw the std1
        var pathData1 = this.radialAreaGenerator1(this.my_points);
    
        d3.select("#previewChart").select("svg")
          .append("g")
          .append('path')
          .attr("class", "std1")
          .attr('d', pathData1);
    
        // draw the value (marker)
        var protein_markers = d3.select("#previewChart").select("svg")
          .append("g").attr("class", "protein_markers");
    
        var sel = protein_markers.selectAll("path").data(this.my_points)
        sel.enter()
          .append("path")
          .attr("d", d3.arc().innerRadius(radius-2).outerRadius(radius+2).startAngle((d)=>d.angle + Math.PI-Math.PI/400).endAngle((d)=>d.angle + Math.PI+Math.PI/400))
          .attr("fill", 'grey')
          .attr("stroke", "black")
          .attr("stroke-width", 0.15)
          .style("opacity", 0.9);
    }
    
    draw_radial_axes() {
        const radius = this.props.radius;
        var r = d3.scaleLinear()
          .domain([0, .5])
          .range([0, radius]);
    
        var svg = d3.select("#previewChart").select('svg');
        var gr = svg.append("g")
          .attr("class", "r axis")
          .selectAll("g")
          .data(r.ticks(10).slice(1))
          .enter().append("g")
    
        gr.append("circle")
          .attr("r", r);
    
        var ga = svg.append("g")
          .attr("class", "a axis")
          .selectAll("g")
          .data(d3.range(0, 360, 30))
          .enter()
          .append("g")
          .append("g")
          .attr("transform", function (d) {
            return "rotate(" + (d + 90) + ")";
          });
    
        ga.append("line")
          .attr("x2", radius + 30);
    
        ga.append("text")
          .attr("x", radius + 20)
          .attr("y", -6)
          .attr("dy", ".20em")
          .style("text-anchor", function (d) {
            return d < 180 && d > 0 ? "end" : null;
          })
          .attr("transform", function (d) {
            return d < 180 && d > 0 ? "rotate(180 " + (radius + 20) + ",-8)" : null;
          })
          .text(function (d) {
            return d + "°";
          });
    }

    diffFun(){
      this.setState({diff:~this.state.diff});
    }

    render() {
        // console.log('render');
        return ( 
          <div className = "block" id = "previewChart">
            <p align="center" style={{
              float: "left",
              width: '90%',
            }}>Quickview</p>
            <button 
            className="btn btn-primary btn-sm" 
            onClick={()=>this.diffFun()}
            style={{
              float: "left",
            }} >Diff</button>
          </div>
        )
    }
}