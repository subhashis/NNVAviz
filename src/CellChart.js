import React, {
  Component
} from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
import my_radial_brush from './my_radial_brush';
import denData from './data/1/d3-dendrogram_protein'
import ToggleButton from 'react-toggle-button';
import stdData from './data/1/d3-dendrogram_protein_std'
let data;

class CellChart extends Component {
  constructor(props) {
    super(props);
    data = this.props.data;
    this.state={
      std: false,
    } 

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
    const uncertainty_scale = 1; //to keep uncertainty bands in scale
    let my_points = [];
    let max_std=-Infinity;
    for (let i = 0; i < valueLen; i += 1) {
      var angle = dummy_data[i];
      var protein_value = data.curve_mean[i];
      var std = data.curve_std[((i + valueLen / 2) % valueLen)] / uncertainty_scale;
      if (std>max_std) max_std = std
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
        let value = radius - 0.5* d.std;
        return value;
      })
      .outerRadius(function (d) {
        let value = radius + 0.5* d.std;
        return value;
      });

    this.radialAreaGenerator2 = d3.radialArea()
      .curve(d3.curveCardinalClosed)
      .angle(function (d) {
        return d.angle;
      })
      .innerRadius(function (d) {
        let v = radius - d.std;
        return v
      })
      .outerRadius(function (d) {
        let v = radius + d.std;
        return v
      });

  }

  componentDidUpdate(){
    this.changeView()
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
      let textD = [];
      if (scale === 'full') {
        for (let i = 0; i < 11; i++) {
          legD.push(i * 400 / 10)
        }
        for (let i = 0; i < 5; i++) {
          textD.push(i * 400 / 4)
        }
      } else {
        for (let i = 0; i < 11; i++) {
          legD.push(this.minValue + i * (this.maxValue - this.minValue) / 10)
        }
        for (let i = 0; i < 5; i++) {
          textD.push(this.minValue + i * (this.maxValue - this.minValue) / 4)
        }
      }
      this.colorScale.domain(legD);
      d3.select("#mychart1").select("g.protein_markers").selectAll("path")
        .attr("fill", d => {
          return this.colorScale(d.value)
        });

      this.legend.data(textD)
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
    let textD = [];
    for (let i = 0; i < 5; i++) {
      textD.push(i * 400 / 4)
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

    legendSvg.attr("viewBox", `0 3 70 12`)
      .style('width','100%')
      .style('padding-left','14%')
      .style('padding-right','14%')
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
    rDenSvg.attr("viewBox", `0 10 100 100`);
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
      .style('stroke','black')
      .style('stroke-width','0.2px')
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
      })
      rDenSvg.append('text')
        .text('Protein Value Cluster')
        .style('text-anchor','start')
        .style('dominant-baseline','baseline')
        .attr('x',5)
        .attr('y',100)
        .style('font-size','6px')
      this.changeView = ()=>{
        let type = this.state.std?'std':'den'
        let root = d3.hierarchy(type==='std'?stdData:denData, function (d) {
          return d.children;
        });
        cluster(root);
        g.selectAll('path')
          .data(root.links().slice(1))
          .attr("d", linksGenerator)
          .style('visibility', (d) => {
            return d.target.height >= 4 ? 'visible' : 'hidden';
          })
        g.selectAll("g")
          .data(root.descendants().slice(1))
          .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
          })
          .select("circle")
          .attr('id',(d,i)=>{
            return 'n'+d.data.name;
          })
          .attr("r", (d,i)=>{
            return i===0?2:1;
          })
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
          })
          this.std_cluster=type==='std'?true:false
          rDenSvg.select('text')
            .text((type==='std'?'Uncertainty ':'Protein ')+'Value Cluster')
      }
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
      .innerRadius(90)
      .outerRadius(105)
      .handleSize(0.08)
      .on("brush", () => {
        this.props.brushMove(brush)
      })
      .on('brushstart', this.props.brushStart)
      .on('brushend', this.props.brushEnd);


    let g1 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
    let g2 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
    let g3 = d3.select("#mychart1").select('svg')
      .append("g")
      .attr("class", "brush")
    let g4 = d3.select('#mychart1').select('svg')
      .append('circle')
      .attr('cx',0)
      .attr('cy',0)
      .attr('r',15)
      .style('fill','#ccffdd')
      .on('click',comButton.bind(this))
    
    function comButton(){
      snapBrush(brush2)
      let extent = brush2.extent()
      let start = extent[0]
      let end = extent[1]
      brush3.extent([end,start])
      start = ((start+20)/40+5)%10
      end = ((end-20)/40+5)%10
      this.props.updateMarks(start,end,'Com')
      lock(g2,'Max')
      lock(g3,'Min')
      g4.style('fill','#0c4')
      g4.on('click',()=>{
        g4.style('fill','#ccffdd')
        g4.on('click',comButton.bind(this))
      })
    }

    let brush2 = my_radial_brush()
      .range([0, this.props.valueLen])
      .innerRadius(60)
      .outerRadius(75)
      .handleSize(0.08)
      .on('brush',()=>{
        actBrushMove(g2)
      })
      .on('brushend',()=>{
        actBrushEnd(g2,brush2,'Max')
      })

    let brush3 = my_radial_brush()
      .range([0, this.props.valueLen])
      .innerRadius(30)
      .outerRadius(45)
      .handleSize(0.08)
      .on('brush',()=>{
        actBrushMove(g3)
      })
      .on('brushend',()=>{
        actBrushEnd(g3,brush3,'Min')
      })

    //prepare group for indi
    d3.select("#mychart1").select("svg")
      .append('g')
      .attr('class', 'indi');

    g1.call(brush);
    g2.call(brush2);
    g3.call(brush3);
    g2.select('path.extent').style('fill','#ffcccc')
    g3.select('path.extent').style('fill','#cceaff')
    let actBrushMove = (g)=>{
      g.actBrushMoved = true
    }
    let actBrushEnd = (g,b,type,color)=>{
      snapBrush(b)
      if(!g.actBrushMoved){
        let extent = b.extent()
        let start = extent[0]
        let end = extent[1]
        start = ((start+20)/40+5)%10
        end = ((end-20)/40+5)%10
        this.props.updateMarks(start,end,type)
        lock(g,type)
      }
      g.actBrushMoved = false
    }
    let lock = (g,type)=>{
      // lock the brush
      g.extentFun = g.select('path.extent').on('mousedown.brush')
      g.resizeFun = g.select('path.resize').on('mousedown.brush')
      g.select('path.extent').on('mousedown.brush',()=>{})
      g.selectAll('path.resize').on('mousedown.brush',()=>{})
      if(type === 'Max'){
        g.select('path.extent').style('fill','#ff1a1a')
      }
      else if (type === 'Min'){
        g.select('path.extent').style('fill','dodgerblue')
      }
      g.on('mousedown',()=>{unlock(g,type)})
      g.locked = true
    }
    let unlock = (g,type)=>{
      if (g.locked){
        g.select('path.extent').on('mousedown.brush',g.extentFun)
        g.selectAll('path.resize').on('mousedown.brush',g.resizeFun)
        g.on('click',null)
        if(type === 'Max'){
          g.select('path.extent').style('fill','#ffcccc')
        }
        else if (type === 'Min'){
          g.select('path.extent').style('fill','#cceaff')
        }
        g.locked = false
      }
    }
    function snapBrush(b){
      const n = 10
      const interval = 400/n
      let start = b.extent()[0]
      let end = b.extent()[1]
      start = (Math.floor(start/interval)*interval+interval/2)%400
      end = (Math.floor(end/interval)*interval+interval/2)%400
      if(end === start) start = (start -40)%400

      b.extent([start,end])
    }
  }

  render() {
    return ( 
      <div className = "block" id = "mychart1">
        <p align="center" className="title">Cell Chart</p>
        <div style={{fontSize:'0.8vw',textAlign:'center', width:'58.3%',float:"left",}}>
          <svg className='cell'></svg>
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
          <svg id='legend'></svg>
        </div>
        <div style={{float:'left',width:'40%',position:'relative',top:'5.5vw'}}>
          <div style={{position: 'absolute',transform:'translate(14vw,14.8vw)',fontSize:'0.8vw'}}>
            <ToggleButton
              inactiveLabel={"Pro"}
              activeLabel={'Uct'}
              value={this.state.std}
              onToggle={(value) => {
                this.setState({
                  std: !value,
                })
              }} />
          </div>
          <svg id='rDendo' ></svg>
        </div>
      
      </div>
    )
  }
}

export default CellChart;