import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {

  componentDidMount(){
    //draw basic 
    let max_allV = 0;
    let maxElement=0;
    let bar_svg = d3.select('#bar').append('svg').attr("id", "bar_svg");
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
        'partV': 0
        };
        if( max_allV < tmp.allV ){
            max_allV = tmp.allV;
        }
        this.props.allSenHist.push( tmp );
    }
    console.log(maxElement);
    max_allV = maxElement;

    let bar_h = parseInt( bar_svg.style("height"), 10 )/3;
    let bar_w = parseInt( bar_svg.style("width"), 10 )/35;

    bar_svg.selectAll("rect1")
    .data(this.props.allSenHist)
    .enter().append("rect")
    .attr("id", "all")
    .attr("class",(d,i)=>{return `p${i}`})
    .attr("transform", function(d, i) { return "translate(" + i*(bar_w+1) + "," + (bar_h*2-(d.allV/max_allV)*bar_h) + ")"; } )
    .attr("width", function(d) { return bar_w; })
		.attr("height", function(d) { return (d.allV/max_allV)*bar_h; });

    bar_svg.selectAll("partial")
        .data(this.props.allSenHist)
        .enter().append("rect")
        .attr("id", "partial")
        .attr("class",(d,i)=>{return `p${i}`})
        .attr("transform", function(d, i) { return "translate(" + i*(bar_w+1) + "," + (bar_h-(d.partV/max_allV)*bar_h) + ")"; } )
        .attr("width", function(d) { return bar_w; })
		    .attr("height", function(d) { return (d.partV/max_allV)*bar_h; })
        .attr("fill", 'red');


    var bga = bar_svg.append("g")
                     .selectAll("g")
                     .data( d3.range(0, 35, 1) )
                     .enter()
                     .append("g")
                     .attr("id", "allBarLabel")
                     .attr("transform", function (d) {
                        return "translate("+ (bar_w/3 + d*(bar_w+1)) + "," + bar_h +")rotate(90)";
                     });

    bga.append("text")
       .attr("x", 0)
       .attr("x", 0)
       .attr("dy", ".20em")
       .text(function (d) {
          return "P" + d;
        });

    var bga2 = bar_svg.append("g")
    .selectAll("g")
    .data( d3.range(0, 35, 1) )
    .enter()
    .append("g")
    .attr("id", "selectBarLabel")
    .attr("transform", function (d) {
        //return "rotate(90)";
        return "translate("+ (bar_w/3 + d*(bar_w+1)) + "," + bar_h*2 +")rotate(90)";
    });

    bga2.append("text")
    .attr("x", 0)
    .attr("x", 0)
    .attr("dy", ".20em")
    .text(function (d) {
    return "P" + d;
    });

  }
  render() {
    return (
      <div className = "barChart" id = "bar" / >
    );
  }
}

export default BarChart;
