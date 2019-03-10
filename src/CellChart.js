import React, {
  Component
} from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
import my_radial_brush from './my_radial_brush';
import denData from './data/1/d3-dendrogram_protein';
let data;

class CellChart extends Component {
  constructor(props) {
    super(props);
    data = this.props.data;

    // prepare radial axes data
    const valueLen = this.props.valueLen;

    // the color scale can be input 
    const paletteName = 'RdYlBu';
    let colors = colorbrewer[paletteName][11];
    colors = colors.slice(0).reverse();
    let dom = [];
    for (let i = 0; i < 11; i += 1) {
      dom.push(i * 400 / 10);
    }
    this.colorScale = d3.scaleLinear().domain(dom).range(colors);

    // calculate the value scale
    this.minValue = Math.min(...data.curve_mean);
    this.maxValue = Math.max(...data.curve_mean);

    const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI / valueLen);
    const uncertainty_scale = 500; //to keep uncertainty bands in scale
    let my_points = [];
    for (let i = 0; i < valueLen; i += 1) {
      var angle = dummy_data[i];
      var protein_value = data.curve_mean[i];
      var std = data.curve_std[((i + valueLen / 2) % valueLen)] / uncertainty_scale;
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
      .attr("d", d3.arc().innerRadius(radius - 2.5).outerRadius(radius + 2.5).startAngle((d) => d.angle + Math.PI - Math.PI / 400).endAngle((d) => d.angle + Math.PI + Math.PI / 400))
      .attr("fill", function (d, i) {
        return colorScale(d.value)
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.15)
      .style("opacity", 0.9)
      .attr('id', function (d, i) {
        if (i === 400) {
          return 'loc0';
        }
        return 'loc' + i;
      });

    // draw brush
    this.drawBrush();

    // change colormap
    const changePalette = paletteName => {
      const classesNumber = 11;
      var colors = colorbrewer[paletteName][classesNumber];
      colors = colors.slice(0).reverse();
      this.colorScale.range(colors);

      //cell chart
      d3.select("#mychart1").select("g.protein_markers").selectAll("path")
        .attr("fill", d => {
          return this.colorScale(d.value)
        });

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

      this.props.changePreColor(this.colorScale);

      //heat map
      let heatcolorScale = d3.scaleQuantize()
        .domain([this.props.sen_min, this.props.sen_max])
        .range(colors);
      d3.select('#heatSvg').selectAll("path.heat")
        .style("fill", function (d) {
          if (d != null) return heatcolorScale(d.value);
          else return "url(#diagonalHatch)";
        })
    };

    d3.select("#cellColorMap")
      .on("keyup", function () {
        var newPalette = d3.select("#cellColorMap").property("value");
        if (newPalette != null) // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
          changePalette(newPalette);
      })
      .on("change", function () {
        var newPalette = d3.select("#cellColorMap").property("value");
        changePalette(newPalette);
      });

    const changeScale = scale => {
      let legD = [];
      if (scale === 'full') {
        for (let i = 0; i < 11; i++) {
          legD.push(i * 400 / 10)
        }
      } else {
        for (let i = 0; i < 11; i++) {
          legD.push(this.minValue + i * (this.maxValue - this.minValue) / 10)
        }
      }
      this.colorScale.domain(legD);
      d3.select("#mychart1").select("g.protein_markers").selectAll("path")
        .attr("fill", d => {
          return this.colorScale(d.value)
        });

      this.props.changePreColor(this.colorScale);

      this.legend.data(legD)
      this.legend.select("text")
        .text(function (d) {
          return d.toFixed(0);
        })
    };

    d3.select("#cellColorScale")
      .on("keyup", function () {
        var newScale = d3.select("#cellColorScale").property("value");
        if (newScale != null) // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
          changeScale(newScale);
      })
      .on("change", function () {
        var newScale = d3.select("#cellColorScale").property("value");
        changeScale(newScale);
      });

    let legD = [];
    for (let i = 0; i < 11; i++) {
      legD.push(i * 400 / 10)
    }

    const legendSvg = d3.select('svg#legend');
    let gradientData = [];
    for (let i=0;i<11;i++){
      let tmp ={};
      tmp.offset = (i*10)+'%';
      tmp.color = this.colorScale.range()[i];
      gradientData.push(tmp);
    }
    let gradient = legendSvg.append("linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%")
      .selectAll("stop")
      .data(gradientData)
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    legendSvg.attr("viewBox", `0 0 70 20`);
    var legend = legendSvg.append("g")
      .attr("class", "legend")
      .selectAll(".legendElement")
      .data(legD)
      .enter().append("g")
      .attr("class", "legendElement");

    this.legend = legend;

    const legendElementWidth = 60 / 10;
    const cellSize = 5;

    legendSvg.append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("class", "cellLegend bordered")
      .attr("width", 60)
      .attr("height", cellSize)
      .style("fill", "url(#svgGradient)");

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

    const rDenSvg = d3.select('svg#rDendo');
    rDenSvg.attr("viewBox", `0 0 100 100`);
    let rad = 50;

    // Create the cluster layout:
    var cluster = d3.cluster()
      .size([360, rad]); // 360 means whole circle. radius - 60 means 60 px of margin around dendrogram

    // Give the data to this cluster layout:
    var root = d3.hierarchy(denData, function (d) {
      return d.children;
    });
    cluster(root);

    // Features of the links between nodes:
    var linksGenerator = d3.linkRadial()
      .angle(function (d) {
        return d.x / 180 * Math.PI;
      })
      .radius(function (d) {
        return d.y;
      });

    // Add the links between nodes:
    let g = rDenSvg.append('g').attr('transform', 'translate(50,50)');

    g.selectAll('path')
      .data(root.links().slice(1))
      .enter()
      .append('path')
      .attr("d", linksGenerator)
      .style("fill", 'none')
      .attr("stroke", '#ccc')
      .style('visibility', (d) => {
        return d.target.height >= 4 ? 'visible' : 'hidden';
      })


    // Add a circle for each node.
    function hiC(root,color){
      root = d3.select('#'+root);
      const children = root.data()[0].data.children;
      root.style('fill',color);
      if(children.length>0){
        hiC('n'+children[0].name,color);
        hiC('n'+children[1].name,color);
      }
    };
    g.selectAll("g")
      .data(root.descendants().slice(1))
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
      })
      .append("circle")
      .attr('id',(d,i)=>{
        return 'n'+d.data.name;
      })
      .attr("r", (d,i)=>{
        return i===0?2:1;
      })
      .style('stroke',(d,i)=>{
        return i===0?'yellow':'none';
      })
      .style("fill", "#69b3a2")
      .style('visibility', (d) => {
        return d.height >= 4 ? 'visible' : 'hidden';
      })
      .on('mouseover', function (d, i) {
        const over = d.data.name.split('-');
        for (const loc of over) {
          d3.selectAll(`path#${loc}`)
            .style('fill', 'yellow')
        }
        hiC('n'+d.data.name,'yellow');
      })
      .on('mouseout', (d, i) => {
        const over = d.data.name.split('-');
        for (const p of over) {
          d3.selectAll(`path#${p}`)
            .style('fill', this.colorScale(d.value));
        }
        hiC('n'+d.data.name,"#69b3a2");
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
  }

  drawBrush() {
    let brush = my_radial_brush()
      .range([0, this.props.valueLen])
      .innerRadius(105)
      .outerRadius(120)
      .handleSize(0.08)
      .on("brush", () => {
        this.props.brushMove(brush)
      })
      .on('brushstart', this.props.brushStart)
      .on('brushend', this.props.brushEnd);


    let brush2 = my_radial_brush()
      .range([0, this.props.valueLen])
      .innerRadius(75)
      .outerRadius(90)
      .handleSize(0.08)

    let brush3 = my_radial_brush()
      .range([0, this.props.valueLen])
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
      .attr('class', 'indi');

    g1.call(brush);
    g2.call(brush2);
    g3.call(brush3);
  }

  render() {
    return ( 
      <div className = "block" id = "mychart1">
        <p align="center">Cell Chart</p>
        <svg className='cell'></svg>
        <div style={{fontSize:'0.8vw'}}>
          Palette:&nbsp;
          <select id="cellColorMap" defaultValue='RdYlBu'>
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
          &emsp;Scale:&nbsp;
          <select id="cellColorScale" defaultValue='full'>
            <option value="full">Full</option>
            <option value="context">Context</option>
          </select>
        </div>
        <svg id='legend'></svg>
        <svg id='rDendo'></svg>
      </div>
    )
  }
}

export default CellChart;