import React, { Component } from 'react';
import * as d3 from 'd3';
import colorbrewer from 'colorbrewer';
import ToggleButton from 'react-toggle-button';
// #4d4d4d grey
// dodgerblue blue
// #0c4 green
// #ff1a1a red

export default class Preview extends Component {
    constructor(props){
      super(props);
      let colors = colorbrewer['RdYlBu'][11];
      colors = colors.slice(0).reverse();
      let dom = [];
      for (let i = 0; i < 11; i += 1) {
        dom.push(i * 400 / 10);
      }
      let colorScale = d3.scaleLinear().domain(dom).range(colors);
      colorScale.scale = 'Full';
      colorScale.palette = 'RdYlBu'
      let cDiff = colorbrewer['RdGy'][11];
      cDiff = cDiff.slice(0).reverse();
      let diffColor = d3.scaleLinear().range(cDiff)
      diffColor.scale = 'Context';
      diffColor.palette = 'RdGy'
      this.state={
        diff : false,
        preColor: colorScale,
        diffColor: diffColor,
      }
  
      // prepare radial axes data
      const valueLen = this.props.valueLen;

      const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 
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
          let value = radius - 0.5 * d.std;
          return value;
        })
        .outerRadius(function (d) {
          let value = radius + 0.5 * d.std;
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
      let colorScale;
      if (this.state.diff) colorScale = this.state.diffColor
      else colorScale = this.state.preColor
      let gradientData = [];
      for (let i=0;i<11;i++){
        let tmp ={};
        tmp.offset = (i*10)+'%';
        tmp.color = colorScale.range()[i];
        gradientData.push(tmp);
      }
      d3.select(this.state.diff?'#preGradientDiff':"#preGradient")
          .selectAll("stop")
          .data(gradientData)
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; });
      this.legendSvg.select('rect')
        .style('fill',this.state.diff?'url(#preGradientDiff)':'url(#preGradient)')
      if (!this.props.previewData){
        // draw color map without scale
        this.legendSvg.select('.legend')
          .style('visibility','hidden')
      }
      else{
        this.legendSvg.select('.legend')
          .style('visibility','visible')
        // calculate the value scale
        this.minValue = Math.min(...this.props.previewData.curve_mean);
        this.maxValue = Math.max(...this.props.previewData.curve_mean);

        const data = this.props.previewData;
        const valueLen = this.props.valueLen;
        const ori = this.props.data;
        const dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 
        const uncertainty_scale = 1; //to keep uncertainty bands in scale
        let my_points = [];
        let legD=[];
        let textD = [];
        
        // normal
        if(!this.state.diff){
          let max_std=-Infinity;
          for (let i = 0; i < valueLen; i += 1) {
            var angle = dummy_data[i];
            var protein_value = data.curve_mean[i];
            var std = data.curve_std[((i + valueLen/2) % valueLen)] / uncertainty_scale;
            if (std>max_std) max_std = std
            let tmp = {
              'angle': angle,
              'std': std,
              'value': protein_value
            };
            my_points.push(tmp);
          }
          let factor = max_std/19.28; // scale to the max value
          for (let i = 0; i < valueLen; i += 1){
            my_points[i].std /=factor
          }
          my_points.push(my_points[0]);
          this.my_points = my_points;
          // calculate domain
          let minValue,maxValue
          if (colorScale.scale === 'Full') {minValue =0;maxValue=400}
          else {minValue = this.minValue;maxValue=this.maxValue}
          legD = []
          for (let i = 0; i < 11; i++) {
            legD.push(minValue + i * (maxValue - minValue) / 10)
          }
          for (let i = 0; i < 5; i++) {
            textD.push(minValue + i * (maxValue - minValue) / 4)
          }
          colorScale.domain(legD);
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
            let protein_value = data.curve_mean[i]-ori.curve_mean[i];
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
          legD = []
          for (let i = 0; i < 11; i++) {
            legD.push(minValue + i * (maxValue - minValue) / 10)
          }
          for (let i = 0; i < 5; i++) {
            textD.push(minValue + i * (maxValue - minValue) / 4)
          }
          colorScale.domain(legD);
          // hide stds
          d3.select("#previewChart")
            .select('path.std2')
            .style('visibility','hidden');
          d3.select("#previewChart")
            .select('path.std1')
            .style('visibility','hidden');

        }

        // change legend text
        this.legend.data(textD);
        this.legend.select("text")
            .text(function (d) {
              return d.toFixed(0);
            })
    
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
        d3.select("#previewChart").select("svg.main")
          .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`);
    
        // draw radial axes
        this.draw_radial_axes();
    
        //draw the std2
        var pathData2 = this.radialAreaGenerator2(this.my_points);
    
        d3.select("#previewChart").select("svg.main")
          .append("g")
          .append('path')
          .attr("class", "std2")
          .attr('d', pathData2);
    
        // draw the std1
        var pathData1 = this.radialAreaGenerator1(this.my_points);
    
        d3.select("#previewChart").select("svg.main")
          .append("g")
          .append('path')
          .attr("class", "std1")
          .attr('d', pathData1);
    
        // draw the value (marker)
        var protein_markers = d3.select("#previewChart").select("svg.main")
          .append("g").attr("class", "protein_markers");
    
        var sel = protein_markers.selectAll("path").data(this.my_points)
        sel.enter()
          .append("path")
          .attr("d", d3.arc().innerRadius(radius-2).outerRadius(radius+2).startAngle((d)=>d.angle + Math.PI-Math.PI/400).endAngle((d)=>d.angle + Math.PI+Math.PI/400))
          .attr("fill", 'grey')
          .attr("stroke", "black")
          .attr("stroke-width", 0.15)
          .style("opacity", 0.9);

        const legendSvg = d3.select("#previewChart").select("svg.legend");
        this.legendSvg = legendSvg;
        let legD = [];
        for (let i = 0; i < 11; i++) {
          legD.push(i * 400 / 10)
        }
        let gradientDataDiff = [];
        for (let i=0;i<11;i++){
          let tmp ={};
          tmp.offset = (i*10)+'%';
          tmp.color = this.state.diffColor.range()[i];
          gradientDataDiff.push(tmp);
        }
        legendSvg.append("linearGradient")
          .attr("id", "preGradientDiff")
          .attr("x1", "0%")
          .attr("x2", "100%")
          .attr("y1", "0%")
          .attr("y2", "0%")
          .selectAll("stop")
          .data(gradientDataDiff)
          .enter().append("stop")
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; });
    
        legendSvg.attr("viewBox", `0 0 100 22`)
          .style('width','100%')

        let textD = [];
        for (let i = 0; i < 5; i++) {
          textD.push(i * 400 / 4)
        }
        var legend = legendSvg.append("g")
          .attr("class", "legend")
          .style('visibility','hidden')
          .selectAll(".legendElement")
          .data(textD)
          .enter().append("g")
          .attr("class", "legendElement");
    
        this.legend = legend;
    
        const legendElementWidth = 60 / 4;
        const cellSize = 5;
    
        let gradientData = [];
        for (let i=0;i<11;i++){
          let tmp ={};
          tmp.offset = (i*10)+'%';
          tmp.color = this.state.preColor.range()[i];
          gradientData.push(tmp);
        }
        legendSvg.append("linearGradient")
          .attr("id", "preGradient")
          .attr("x1", "0%")
          .attr("x2", "100%")
          .attr("y1", "0%")
          .attr("y2", "0%")
          .selectAll("stop")
          .data(gradientData)
          .enter().append("stop")
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; });

        legendSvg.append("rect")
          .attr("x", 20)
          .attr("y", 5)
          .attr("class", "cellLegend bordered")
          .attr("width", 60)
          .attr("height", cellSize)
          .style("fill", "url(#preGradient)");
    
        legend.append("text")
          .attr("class", "mono legendElement")
          .text(function (d) {
            return d.toFixed(0);
          })
          .style('font-size', '0.12vw')
          .attr("x", function (d, i) {
            return 20 + legendElementWidth * i;
          })
          .attr("y", 5 + cellSize +1)
          .style('text-anchor', 'middle')
          .style('dominant-baseline', 'hanging');
        
        // change colormap
        const changePalette = paletteName => {
          let curScale = this.state.diff?'diffColor':'preColor'
          const classesNumber = 11;
          let colors = colorbrewer[paletteName][classesNumber];
          let scale = d3.scaleLinear().domain(this.state[curScale].domain())
          colors = colors.slice(0).reverse();
          scale.range(colors);
          scale.palette = paletteName
          let tmp = {}
          tmp[curScale] = scale
          this.setState(tmp)
        };

        d3.select("#preColorMap")
          .on("keyup", function () {
            var newPalette = d3.select("#preColorMap").property("value");
            if (newPalette != null) // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
              changePalette(newPalette);
          })
          .on("change", function () {
            var newPalette = d3.select("#preColorMap").property("value");
            changePalette(newPalette);
          });

        const changeScale = scale => {
          let scaleType = this.state.diff?'diffColor':'preColor'
          let tmp =d3.scaleLinear().range(this.state[scaleType].range())
          tmp.domain(this.state[scaleType].domain())
          tmp.scale =  scale
          this.setState({preColor:tmp})
        };
      
        d3.select("#preColorScale")
          .on("keyup", function () {
            var newScale = d3.select("#preColorScale").property("value");
            if (newScale != null) // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
              changeScale(newScale);
          })
          .on("change", function () {
            var newScale = d3.select("#preColorScale").property("value");
            changeScale(newScale);
          });
    }
    
    draw_radial_axes() {
        const radius = this.props.radius;
        var r = d3.scaleLinear()
          .domain([0, .5])
          .range([0, radius]);
    
        var svg = d3.select("#previewChart").select('svg.main');
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
        let scale = this.state.diff?this.state.diffColor:this.state.preColor
        let p = scale.palette
        let s = scale.scale
        console.log(p)
        return ( 
          <div className = "block" id = "previewChart">
              <div style = {{height:'2vw'}}>
                <p style={{position: 'relative',left: '40%',float:'left'}} className='title'>Quickview</p>
                <div style={{position: 'relative',left: '17vw',top:'0.25vw',float:'left',fontSize:'0.8vw'}}>
                  <ToggleButton
                    inactiveLabel={"Val"}
                    activeLabel={'Dif'}
                    value={this.state.diff}
                    onToggle={(value) => {
                      this.setState({
                        diff: !value,
                      })
                    }} />
                </div>
              </div>
              <svg className='main'></svg>
              <div style={{fontSize:'0.8vw',textAlign:'center'}}>
                Palette:&nbsp;
                <select id="preColorMap" value = {p} readOnly>
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
                <select id="preColorScale" value = {s} readOnly>
                  <option value="Context">Context</option>
                  {this.state.diff?null:<option value="Full">Full</option>}
                </select>
              </div>
              <svg className='legend'></svg>
          </div>
        )
    }
}