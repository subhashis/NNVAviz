import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {

  constructor(props){
    super(props);

    // console.log('sensivity bounds:');
    // console.log(sen_max);
    // console.log(sen_min);
    // console.log('sensitivity data:')
    // console.log(sen_data);
  }
  componentDidMount(){
    //draw basic 
    let max_allV = 0;
    let bar_svg = d3.select('#bar').append('svg').attr("id", "bar_svg");
    for( let i=0; i<35; i++ ){
        let sum = 0;
        let index = i * 400;
        for( let j=0; j<400; j++ ){
        sum += this.props.sen_data[index + j].value
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

    let bar_h = parseInt( bar_svg.style("height"), 10 )/35;
    let bar_w = parseInt( bar_svg.style("width"), 10 );

    bar_svg.selectAll("rect1")
    .data(this.props.allSenHist)
    .enter().append("rect")
    .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i*bar_h+1) + ")"; } )
    .attr("width", function(d) { return (d.allV/max_allV)*bar_w; })
    .attr("height", function(d) { return bar_h-2; })
    .attr("opacity", 0.3);

    bar_svg.selectAll("partial")
        .data(this.props.allSenHist)
        .enter().append("rect")
        .attr("id", "partial")
        .attr("transform", function(d, i) { return "translate(" + 0 + "," + (i*bar_h+3) + ")"; } )
        .attr("width", function(d) { return (d.partV/max_allV)*bar_w; })
        .attr("height", function(d) { return bar_h-6; })
        .attr("fill", 'red')
        .attr("opacity", 0.7);
  }
  render() {
    return (
      <div className = "barChart" id = "bar" / >
    );
  }
}

export default BarChart;
