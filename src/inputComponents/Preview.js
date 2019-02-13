import React, { Component } from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
// import my_radial_brush from '../my_radial_brush';

export default class Preview extends Component {
    constructor(props){
      super(props);
      // console.log('cons');
  
      // prepare radial axes data
      const valueLen = this.props.valueLen;
      
      // the color scale can be input 
      const paletteName = 'PiYG';
      let colors = colorbrewer[paletteName][11];
      colors = colors.slice(0).reverse();
      this.colorScale = d3.scaleQuantize().domain([0.0, valueLen]).range(colors);
      

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
        // console.log('didupdate');
        // console.log(this.props.previewData);
        
      // calculate the value scale
        if (this.props.previewData){
          this.minValue = Math.min(...this.props.previewData.curve_mean);
          this.maxValue = Math.max(...this.props.previewData.curve_mean);
        }

        const data = this.props.previewData;
        const valueLen = this.props.valueLen;
        const radius = this.props.radius;
        const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 
        const uncertainty_scale = 500; //to keep uncertainty bands in scale
        let my_points = [];
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
        var pathData2 = this.radialAreaGenerator2(this.my_points);
  
        d3.select("#previewChart")
          .select('path.std2')
          .attr('d', pathData2);
    
        // draw the std1
        var pathData1 = this.radialAreaGenerator1(this.my_points);
    
        d3.select("#previewChart")
          .select('path.std1')
          .attr('d', pathData1);
    
        // draw the value (marker)
        const colorScale = this.colorScale;
        var protein_markers = d3.select("#previewChart")
          .select("g.protein_markers");
    
        var sel = protein_markers.selectAll("circle").data(my_points);
        sel.attr("r", "1.18")
          .attr("cy", function (d, i) {
            return radius * Math.sin(d.angle + Math.PI / 2)
          })
          .attr("cx", function (d, i) {
            return radius * Math.cos(d.angle + Math.PI / 2)
          })
          .attr("fill", function (d, i) {
            return colorScale(d.value)
          })
          .attr("stroke", "black")
          .attr("stroke-width", 0.15)
          .style("opacity", 0.9);
      }
    
      componentDidMount() {
        // console.log('didmount');
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
        const colorScale = this.colorScale;
        var protein_markers = d3.select("#previewChart").select("svg")
          .append("g").attr("class", "protein_markers");
    
        var sel = protein_markers.selectAll("circle").data(this.my_points)
        sel.enter().append("circle")
          .attr("r", "1.18")
          .attr("cy", function (d, i) {
            return radius * Math.sin(d.angle + Math.PI / 2)
          })
          .attr("cx", function (d, i) {
            return radius * Math.cos(d.angle + Math.PI / 2)
          })
          .attr("fill", function (d, i) {
            return colorScale(d.value)
          })
          .attr("stroke", "black")
          .attr("stroke-width", 0.15)
          .style("opacity", 0.9);

        // set up colormap
        const changePalette = paletteName=> {
          const classesNumber = 11;
          var colors = colorbrewer[paletteName][classesNumber];
          colors = colors.slice(0).reverse();
          this.colorScale.range(colors);

          d3.select("#previewChart").select("g.protein_markers").selectAll("circle")
            .attr("fill", d=> {
              return this.colorScale(d.value)
            });
        };

        d3.select("#preColorMap")
          .on("keyup", function() {
            var newPalette = d3.select("#preColorMap").property("value");
            if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
            changePalette(newPalette);
          })
          .on("change", function() {
            var newPalette = d3.select("#preColorMap").property("value");
            changePalette(newPalette);
          });
    
          const changeScale = scale=> {
            if (scale === 'full'){
              this.colorScale.domain([0,400]);
            }
            else {
              console.log(this.maxValue);
              this.colorScale.domain([this.minValue,this.maxValue]);
            }
            d3.select("#previewChart").select("g.protein_markers").selectAll("circle")
              .attr("fill", d=> {
                return this.colorScale(d.value)
              });
          };
        
          d3.select("#preColorScale")
            .on("keyup", function() {
              var newScale = d3.select("#preColorScale").property("value");
              if (newScale != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
              changeScale(newScale);
            })
            .on("change", function() {
              var newScale = d3.select("#preColorScale").property("value");
              changeScale(newScale);
            });
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

      render() {
        // console.log('render');
        return ( 
          <div className = "chart" id = "previewChart">
            <p align="center">Preview</p>
            Palette:
            <select id="preColorMap" defaultValue='PiYG'>
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
            &emsp;Scale:
            <select id="preColorScale" defaultValue='full'>
              <option value="full">Full</option>
              <option value="context">Context</option>
            </select>
          </div>
        )
      }
}