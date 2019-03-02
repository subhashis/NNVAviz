import React, {
  Component
} from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
import my_radial_brush from './my_radial_brush';
let data;

class CellChart extends Component {
  constructor(props){
    super(props);
    data = this.props.data;

    // prepare radial axes data
    const valueLen = this.props.valueLen;

    // the color scale can be input 
    const paletteName = 'PiYG';
    let colors = colorbrewer[paletteName][11];
    colors = colors.slice(0).reverse();
    this.colorScale = d3.scaleQuantize().domain([0.0, 400]).range(colors);

    // calculate the value scale
    this.minValue = Math.min(...data.curve_mean);
    this.maxValue = Math.max(...data.curve_mean);

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
        'value': protein_value,
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
    d3.select("#mychart1").select("svg.cell")
      .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`)

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

    var sel = protein_markers.selectAll("path").data(this.my_points)
    sel.enter()
      .append("path")
      .attr("d", d3.arc().innerRadius(radius-2.5).outerRadius(radius+2.5).startAngle((d)=>d.angle + Math.PI-Math.PI/400).endAngle((d)=>d.angle + Math.PI+Math.PI/400))
      .attr("fill", function (d, i) {
        return colorScale(d.value)
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.15)
      .style("opacity", 0.9);
    
      // .append("circle")
      // .attr("r", "1.18")
      // .attr("cy", function (d, i) {
      //   return radius * Math.sin(d.angle + Math.PI / 2)
      // })
      // .attr("cx", function (d, i) {
      //   return radius * Math.cos(d.angle + Math.PI / 2)
      // })

    // draw brush
    this.drawBrush();

    // set up colormap
    const changePalette = paletteName=> {
      const classesNumber = 11;
      var colors = colorbrewer[paletteName][classesNumber];
      colors = colors.slice(0).reverse();
      this.colorScale.range(colors);

      d3.select("#mychart1").select("g.protein_markers").selectAll("path")
        .attr("fill", d=> {
          return this.colorScale(d.value)
        });
    };

		d3.select("#cellColorMap")
      .on("keyup", function() {
        var newPalette = d3.select("#cellColorMap").property("value");
        if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
        changePalette(newPalette);
      })
      .on("change", function() {
        var newPalette = d3.select("#cellColorMap").property("value");
        changePalette(newPalette);
      });

    const changeScale = scale=> {
      if (scale === 'full'){
        this.colorScale.domain([0,400]);
      }
      else {
        this.colorScale.domain([this.minValue,this.maxValue]);
      }
      d3.select("#mychart1").select("g.protein_markers").selectAll("path")
        .attr("fill", d=> {
          return this.colorScale(d.value)
        });
    };
  
    d3.select("#cellColorScale")
      .on("keyup", function() {
        var newScale = d3.select("#cellColorScale").property("value");
        if (newScale != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
        changeScale(newScale);
      })
      .on("change", function() {
        var newScale = d3.select("#cellColorScale").property("value");
        changeScale(newScale);
      });
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
    const rDenSvg=d3.select('svg#rDendo');
    rDenSvg.attr("viewBox", `0 0 100 100`);
    rDenSvg.append('rect').attr('width','100%').attr('height','100%').style('fill','red');

    const legendSvg=d3.select('svg#legend');
    legendSvg.attr("viewBox", `0 0 70 25`);
    legendSvg.append('rect').attr('width','100%').attr('height','100%').style('fill','black');
    
    console.log(rDenSvg);
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


    let brush2 = my_radial_brush()
      .range([0,this.props.valueLen])
      .innerRadius(75)
      .outerRadius(90)
      .handleSize(0.08)

    let brush3 = my_radial_brush()
      .range([0,this.props.valueLen])
      .innerRadius(45)
      .outerRadius(60)
      .handleSize(0.08)

    let g2 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
    let g1 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
    let g3 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")

    //prepare group for indi
    d3.select("#mychart1").select("svg")
      .append('g')
      .attr('class','indi');

    g1.call(brush);
    g2.call(brush2);
    g3.call(brush3);
  }

  render() {
    return ( 
      <div className = "block" id = "mychart1">
        <p align="center">Cell Chart</p>
        <svg className='cell'></svg>
        <svg id='legend'></svg>
        <svg id='rDendo'></svg>

        {/* Palette:
        <select id="cellColorMap" defaultValue='PiYG'>
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
        <select id="cellColorScale" defaultValue='full'>
          <option value="full">Full</option>
          <option value="context">Context</option>
        </select> */}
      </div>
    )
  }
}

export default CellChart;