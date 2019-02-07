import React, {
  Component
} from 'react';
import data from './data/1/NNVA_data';
import * as d3 from 'd3';
import my_radial_brush from './my_radial_brush';

class CellChart extends Component {
  constructor(props){
    super(props);

    // prepare radial axes data
    const valueLen = this.props.valueLen;
    // the color scale can be input 
    this.colorScale = d3.scaleLinear().domain([0.0, valueLen]).range(["#33ccff", "#ff6600"]);
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

  componentDidMount() {
    const width = this.props.size;
    const radius = this.props.radius;

    // create svg
    d3.select("#mychart1").append("svg")
      .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`);

    // draw radial axes
    this.draw_radial_axes();

    //draw the std2
    var pathData2 = this.radialAreaGenerator2(this.my_points);

    d3.select("#mychart1").select("svg")
      .append("g")
      .append('path')
      .attr("class", "std2")
      .attr('d', pathData2);

    // draw the std1
    var pathData1 = this.radialAreaGenerator1(this.my_points);

    d3.select("#mychart1").select("svg")
      .append("g")
      .append('path')
      .attr("class", "std1")
      .attr('d', pathData1);

    // draw the value (marker)
    const colorScale = this.colorScale;
    var protein_markers = d3.select("#mychart1").select("svg")
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

    // draw brush
    this.drawBrush();
  }

  draw_radial_axes() {
    const radius = this.props.radius;
    var r = d3.scaleLinear()
      .domain([0, .5])
      .range([0, radius]);

    var svg = d3.select("#mychart1").select('svg');
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

  drawBrush(){
    let brush = my_radial_brush()
      .range([0,this.props.valueLen])
      .innerRadius(105)
      .outerRadius(120)
      .handleSize(0.08)
      .on("brush", ()=>{this.props.brushMove(brush)})
      .on('brushstart',this.props.brushStart)
      .on('brushend',this.props.brushEnd);

    d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
      .call(brush);

    d3.select("#mychart1").select("svg").append("g")
      .attr("class", "linear")
      .attr("transform", "translate(40,350)");
  }

  render() {
    return ( 
      <div className = "chart" id = "mychart1">
        <p align="center">Cell Chart</p>
      </div>
    )
  }
}

export default CellChart;