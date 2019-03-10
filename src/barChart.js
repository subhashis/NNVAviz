import React, { Component } from 'react';
import * as d3 from 'd3';
import Slider from 'rc-slider';
import data from './data/1/d3-dendrogram_param_sensitivity';

class BarChart extends Component {
  constructor(props){
    super(props);
    this.bar_h = 30;
    let bar_h = this.bar_h;
    var width = 100-bar_h*2-5;
    var height = 100;

    // Create the cluster layout:
    // var cluster = d3.cluster()
    //   .size([height, width]);

    let tree = d3.tree()
      .size([height,width]);


    // Give the data to this cluster layout:
    var root = d3.hierarchy(data, function(d) {
        return d.children;
    });
    tree(root);
    this.nodeData = root.descendants().slice(1);
    this.state = {
      maxDepth: root.height,
      currentDepth: 4,
    }
  }

  componentDidMount(){
    //draw basic 
    let max_allV = 0;
    let maxElement=0;
    let bar_svg = d3.select('#bar').select('svg').attr("id", "bar_svg");
    const allColor='#3239ff';
    const partColor='#f46b42';
    for( let i=0; i<35; i++ ){
        let sum = 0;
        let index = i * 400;
        for( let j=0; j<400; j++ ){
          sum += this.props.sen_data[index + j].value;
          if( maxElement < this.props.sen_data[index + j].value ){
            maxElement = this.props.sen_data[index + j].value;
          }
        }
        let tmp = {
          'allV': sum / 400,
          'partV': 0,
        };
        if( max_allV < tmp.allV ){
            max_allV = tmp.allV;
        }
        this.props.allSenHist.push( tmp );
    }
    max_allV = maxElement;

    this.max_allV = max_allV;

    bar_svg.attr("viewBox", `0 0 100 100`)

    let bar_h = this.bar_h;
    let bar_w = 100/35;

    // set up the group
    let senDen=bar_svg.append('g')
      .attr('id','senDen')
      .attr('transform','rotate(90) translate(0,-100)');

    let curve = function(d) {
      return "M" + d.y + "," + d.x
              + "L" + (d.parent.y) + "," + d.x
              + " " + d.parent.y + "," + d.parent.x;
      } 

    let nodeData = this.nodeData;
    let leaves = [];

    for (const node of nodeData){
      if(node.data.children.length===0){
        const id = parseInt(node.data.name.slice(1));
        let tmp = Object.assign({}, node);
        tmp.allV=this.props.allSenHist[id].allV;
        tmp.partV = 0;
        leaves.push(tmp);
      }
    }

    this.leaves = leaves;

    // Add the links between nodes:
    this.links = senDen.selectAll('path')
      .data( nodeData )
      .enter()
      .append('path')
      .attr("d", curve)
      .style("fill", 'none')
      .attr("stroke", '#ccc')
      .style('visibility', (d)=>{
        return d.depth<=this.state.currentDepth?'visible':'hidden';
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
    
    this.nodes = senDen.selectAll("g")
        .data( nodeData )
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")"
        })
        .append("circle")
        .attr("r", 1)
        .style("fill", "#69b3a2")
        .attr('id',(d,i)=>{
          return 'n'+d.data.name;
        })
        .style('visibility', (d)=>{
          return d.depth<=this.state.currentDepth?'visible':'hidden';
        })
        .on('mouseover',function(d,i){
          const over = d.data.name.split('-');
          for (const p of over){
            d3.selectAll(`rect.${p}`)
              .style('fill','yellow')
          }
          hiC('n'+d.data.name,'yellow');
        })
        .on('mouseout',function(d,i){
          const over = d.data.name.split('-');
          for (const p of over){
            d3.selectAll(`rect.${p}#all`)
            .style('fill',allColor);
            d3.selectAll(`rect.${p}#partial`)
            .style('fill',partColor);
          }
          hiC('n'+d.data.name,"#69b3a2");
        });

    const sE = 100-2*this.bar_h;
    const fE = sE+this.bar_h;
    const seE = fE+this.bar_h;

    bar_svg.selectAll("#bg")
      .data(leaves.slice(0).sort((a,b)=>{return a.x-b.x}))
      .enter().append("rect")
      .attr("id", "bg")
      .attr("transform", function(d, i) { return "translate(" + bar_w*i + ","+sE+")"; } )
      .style('fill',function(d,i){
        return (i%2===1)?'white':'#E5E7E9';
      })
      .attr("width", bar_w)
      .attr("height", bar_h*2);

          
    bar_svg.selectAll("#all")
      .data(this.props.allSenHist)
      .enter().append("rect")
      .attr("id", "all")
      .attr("class",(d,i)=>{return 'p'+i})
      .attr("transform", function(d, i) { return "translate(" + bar_w*i + "," + (fE-(d.allV/max_allV)*bar_h) + ")"; } )
      .attr("width", bar_w)
      .attr("fill", allColor)
      .attr("height", function(d) { return (d.allV/max_allV)*bar_h; })
      .on('mouseover', (d,i)=>{
        const svg = d3.select('#mychart2').select('svg');
        svg.select('#senValue')
          .text(`${d.allV.toFixed(2)}`);
        svg.select('#P')
          .text(this.props.paraName[i]);
        d3.selectAll(`rect.${'p'+i}#all`)
          .style('fill','yellow')
      })
      .on('mouseout',function(d,i){
        d3.selectAll(`rect.${'p'+i}#all`)
          .style('fill',allColor);
      });
    
      
    this.partial = bar_svg.selectAll("#partial")
      .data(this.props.allSenHist)
      .enter().append("rect")
      .attr("id", "partial")
      .attr("class",(d,i)=>{return 'p'+i})
      .attr("transform", function(d, i) { return "translate(" + bar_w*i + "," + (seE-(d.partV/max_allV)*bar_h) + ")"; } )
      .attr("width", bar_w)
      .attr("height", function(d) { return (d.partV/max_allV)*bar_h; })
      .attr("fill", partColor)
      .on('mouseover', (d,i)=>{
        const svg = d3.select('#mychart2').select('svg');
        svg.select('#senValue')
          .text(`${d.partV.toFixed(2)}`);
        svg.select('#P')
          .text(this.props.paraName[i]);
        d3.selectAll(`rect.${'p'+i}#partial`)
          .style('fill','yellow')
      })
      .on('mouseout',function(d,i){
        d3.selectAll(`rect.${'p'+i}#partial`)
          .style('fill',partColor);
      });

  }
  
  componentDidUpdate(){
    let bar_h = this.bar_h;
    let bar_w = 100/35;
    const sE = 100-2*this.bar_h;
    const max_allV = this.max_allV;
    const fE = sE+this.bar_h;
    const seE = fE+this.bar_h;

    for (let node of this.leaves){
      const id = parseInt(node.data.name.slice(1));
      node.partV=this.props.allSenHist[id].partV;
    }
    
		this.partial
      .data(this.props.allSenHist)
      .transition().duration(750)
      .attr("transform", function(d, i) { 
        return "translate(" + bar_w*i + "," + (seE-(d.partV/max_allV)*bar_h) + ")"; } )
      .attr("width", bar_w)
      .attr("height", function(d) { return (d.partV/max_allV)*bar_h; })

    // Update node and link
    this.nodes.style('visibility', (d)=>{
        return d.depth<=this.state.currentDepth?'visible':'hidden';
      })
    this.links.style('visibility', (d)=>{
          return d.depth<=this.state.currentDepth?'visible':'hidden';
        })
  }
  render() {
    let marks = {};
    for (let i=1;i<=this.state.maxDepth;i++){
      marks[i]={
        label:i,
      }
    }
    return (
      <div>
        <p style={{float:"left"}}>Depth:</p>
        <Slider 
          style={{
            width: '40%',
            float: 'left',
            marginTop: '0.2vw',
            marginLeft: '0.6vw',
          }}
          min={1}
          max={this.state.maxDepth}
          defaultValue={this.state.currentDepth}
          onChange={(value)=>{
            this.setState({currentDepth:value});
          }}
          step={1}
          marks= {marks}
        />
        <div className = "barChart" id = "bar">
          <svg style={{width:"95%"}}></svg>
        </div>
      </div>
      
    );
  }
}

export default BarChart;
