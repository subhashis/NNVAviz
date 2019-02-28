import React, { Component } from 'react';
import * as d3 from 'd3';
import data from './data/d3-dendrogram_param_sensitivity';

class BarChart extends Component {

  componentDidMount(){
    //draw basic 
    let max_allV = 0;
    let maxElement=0;
    let bar_svg = d3.select('#bar').select('svg').attr("id", "bar_svg");
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

    bar_svg.attr("viewBox", `0 0 100 100`)

    let bar_h = 15;
    // let bar_w = 100/35;

    // set up the group
    let senDen=bar_svg.append('g')
      .attr('id','senDen')
      .attr('transform','rotate(-90) translate(-101,0)');

    var width = 70;
    var height = 100;

    // Create the cluster layout:
    var cluster = d3.cluster()
      .size([height, width]);

    // Give the data to this cluster layout:
    var root = d3.hierarchy(data, function(d) {
        return d.children;
    });
    cluster(root);


    let nodeData = root.descendants().slice(1);
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
    senDen.selectAll('path')
      .data( nodeData )
      .enter()
      .append('path')
      .attr("d", function(d) {
          return "M" + d.y + "," + d.x
                  + "C" + (d.parent.y + 5) + "," + d.x
                  + " " + (d.parent.y + 5) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                  + " " + d.parent.y + "," + d.parent.x;
                })
      .style("fill", 'none')
      .attr("stroke", '#ccc')


    // Add a circle for each node.
    senDen.selectAll("g")
        .data( nodeData )
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")"
        })
        .append("circle")
          .attr("r", 1)
          .style("fill", "#69b3a2")

    bar_svg.selectAll("#bg")
      .data(leaves.slice(0).sort((a,b)=>{return a.x-b.x}))
      .enter().append("rect")
      .attr("id", "bg")
      .attr("transform", function(d, i) { return "translate(" + (d.x-1) + ",0)"; } )
      .style('fill',function(d,i){
        return (i%2===0)?'white':'#E5E7E9';
      })
      .attr("width", 2)
      .attr("height", bar_h*2);
          
    bar_svg.selectAll("#all")
      .data(leaves)
      .enter().append("rect")
      .attr("id", "all")
      .attr("class",(d,i)=>{return d.data.name})
      .attr("transform", function(d, i) { return "translate(" + (d.x-1) + "," + (bar_h*2-(d.allV/max_allV)*bar_h) + ")"; } )
      .attr("width", 2)
      .attr("height", function(d) { return (d.allV/max_allV)*bar_h; });
    
      
    bar_svg.selectAll("#partial")
      .data(leaves)
      .enter().append("rect")
      .attr("id", "partial")
      .attr("class",(d,i)=>{return d.data.name})
      .attr("transform", function(d, i) { return "translate(" + (d.x-1) + "," + (bar_h-(d.partV/max_allV)*bar_h) + ")"; } )
      .attr("width", 2)
      .attr("height", function(d) { return (d.partV/max_allV)*bar_h; })
      .attr("fill", 'red');

  }
  
  componentDidUpdate(){
    let bar_svg = d3.select('#bar').select('svg');
    let bar_h = 15;
    const maxElement = this.props.maxElement;

    for (let node of this.leaves){
      const id = parseInt(node.data.name.slice(1));
      node.partV=this.props.allSenHist[id].partV;
    }
    
		bar_svg.selectAll("#partial")
      .data(this.leaves)
      .transition().duration(750)
      .attr("transform", function(d, i) { return "translate(" + (d.x-1) + "," + (bar_h-(d.partV/maxElement)*bar_h) + ")"; } )
      .attr("width", 2)
      .attr("height", function(d) { return (d.partV/maxElement)*bar_h; })
      .attr("fill", 'red');
  }
  render() {
    return (
      <div className = "barChart" id = "bar">
        <svg></svg>
      </div>
    );
  }
}

export default BarChart;
