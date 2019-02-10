import React, { Component } from 'react';
import * as d3 from 'd3';
import CellChart from './CellChart';
import HeatChart from './HeatChart';
import BarChart from './barChart';
import $ from 'jquery';
import data from './data/1/NNVA_data';

class OutputCharts extends Component {
	constructor(props){
		super(props);
		// this.state = {
		// 	selectV: [],
		// }
		this.selectionStarted = false;
		this.valueLen = 400;
		this.selectV = [];
		for (let i=0;i<400;i++){
			this.selectV.push(i);
		}
		this.allSenHist = [];

		// prepare sensitivity
		this.sen_data = [];
		this.sen_max = data.sensitivity[0] * 100000;
		this.sen_min = data.sensitivity[0] * 100000;
	
		for (var i = 0; i < 400 * 35; i++) {
			this.sen_data[i] = {
			title: "Segment " + i,
			value: Math.round((data.sensitivity[i] * 100000))
			};
			if (data.sensitivity[i] * 100000 > this.sen_max)
			this.sen_max = data.sensitivity[i] * 100000;
			if (data.sensitivity[i] * 100000 < this.sen_min)
			this.sen_min = data.sensitivity[i] * 100000;
		}
	
		this.sen_mid_point = (this.sen_max + this.sen_min) / 2;
	}

	componentDidMount(){
		// set up zoom functions
		const svg = d3.select('#heatSvg');
		function zoom() {
			svg.select('#selectedHeat')
			.attr('transform', 'rotate(180) translate(' + -d3.event.transform.x + ',' + -d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
		}
		this.zoomListener = d3.zoom().scaleExtent([1, 4.5]).on("zoom", zoom);
		svg.call(this.zoomListener);
		
	}

	updateSelection() {
		const valueLen = this.valueLen;
		let start = Math.ceil(this.start);
		let end = Math.ceil(this.end);
		let new_selectV = [];  //array to hold new selection
		if (start < end) {
			for(let i = start;i<end;i++){
				new_selectV.push(i);
			}
		} else {
			for(let i=start;i<valueLen;i++){
				new_selectV.push(i);
			}
			for(let i=0;i<end;i++){
				new_selectV.push(i);
			}
		}
		new_selectV.sort((a,b)=>{return a-b});
		this.new_selectV = new_selectV;

		// draw mask
		let mask = d3.select('div#mychart2').select('svg').select('#mask');
		let sA = Math.PI*2*start/400+Math.PI;
		let eA = Math.PI*2*end/400+Math.PI;
		if(eA>sA) eA-=Math.PI*2;

		mask.attr('d',d3.arc().innerRadius(50).outerRadius(35*3+50).startAngle(eA).endAngle(sA));

	
		// regeister animation
		this.ani = requestAnimationFrame(this.updateSelection.bind(this));
	}

	brushStart(){
		console.log('brush started');
		const svg = d3.select('#heatSvg');
		const id = d3.zoomIdentity.scale(1.1);
		svg.call(this.zoomListener.transform, id);
		d3.select('#selectedHeat')
		.attr('transform', 'rotate(180) scale(1)')
		.style("filter", null);
		$('#mask').appendTo($('#mask').parent());
		this.ani = this.updateSelection();
	}
	brushEnd(){
		console.log('brush ended');
		cancelAnimationFrame(this.ani);
		const selectV = this.selectV;
		const new_selectV = this.new_selectV;
		// calculate add and sub selection
		let add_select=[]; //additional element comapared to old selection
		let sub_select=[]; //canceled element compared to old
		let i1=0, i2=0;
		while(true){
			if(i1===new_selectV.length){
				for(let j=i2;j<selectV.length;j++){
					sub_select.push(selectV[j]);
				}
				break;
			}
			else if(i2===selectV.length){
				for(let j=i1;j<new_selectV.length;j++){
					add_select.push(new_selectV[j]);
				}
				break;
			}
			else if(new_selectV[i1]===selectV[i2]){
				i1++;i2++;
			}
			else if(new_selectV[i1]<selectV[i2]){
				add_select.push(new_selectV[i1]);
				i1++;
			}
			else{
				sub_select.push(selectV[i2]);
				i2++;
			}
		}

		// shadow effect
		if(!this.selectionStarted){
			for (const index of this.new_selectV){
				$('#selectedHeat').append($(`path.heat.v${index}`));
			}
			this.selectionStarted = true;
		} else {
			for(const index of sub_select){
				$('.circular-heat').append($(`path.heat.v${index}`));
			}
			for (const index of add_select){
				$('#selectedHeat').append($(`path.heat.v${index}`));
			}
		}
		d3.select('#selectedHeat')
		.attr('transform', 'rotate(180) scale(1)');
		// .style("filter", "url(#drop-shadow)");
		
		$('#selectedHeat').appendTo($('#selectedHeat').parent());

		this.selectV = new_selectV;

		// update bar chart
		let bar_svg = d3.select("#bar_svg");
		let bar_h = parseInt( bar_svg.style("height"), 10 )/35;
		let bar_w = parseInt( bar_svg.style("width"), 10 );

		let barMax = 0;
		for( let i = 0; i < 35; i++ ){
			let sum = 0;
			let index = i * 400 + selectV[0];
			for( let j = 0; j<selectV.length; j++ ){
				sum += this.sen_data[index + j].value;
			}
			this.allSenHist[i].partV = sum;//parseFloat(sum /selectV.length);
			if( barMax < this.allSenHist[i].partV ){
				barMax = this.allSenHist[i].partV
			}
			if( barMax < this.allSenHist[i].allV ){
				barMax = this.allSenHist[i].allV
			}
		}
		barMax = barMax<=0?1:barMax

		bar_svg.selectAll("#all")
		.data(this.allSenHist)
		.transition().duration(750)
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + (i*bar_h) + ")"; } )
		.attr("width", function(d) { return (d.allV/barMax)*bar_w; })
		.attr("height", function(d) { return bar_h/2 -2 ; });

		bar_svg.selectAll("#partial")
		.data(this.allSenHist)
		.transition().duration(750)
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + ((i+0.5)*bar_h-1) + ")"; } )
		.attr("width", function(d) { return (d.partV/barMax)*bar_w; })
		.attr("height", function(d) { return bar_h/2 -2; })
		.attr("fill", 'red');
	}
	brushMove(brush){
		const extent = brush.extent();
		const valueLen = this.valueLen;
		this.start = (extent[0]+valueLen/2)%valueLen;
		this.end = (extent[1]+valueLen/2)%valueLen;
	}

  render() {
    return (
		<div id="outputs" >
			<CellChart 
				radius={150} 
				size={400} 
				valueLen={400}
				brushStart = {this.brushStart.bind(this)}
				brushEnd = {this.brushEnd.bind(this)}
				brushMove = {this.brushMove.bind(this)}
			/>
			
			<HeatChart radius={150} 
						size={400} 
						sen_data={this.sen_data} 
						sen_min={this.sen_min} 
						sen_max={this.sen_max} 
						sen_mid_point={this.sen_mid_point}
			/>
			<BarChart  sen_data={this.sen_data} 
						sen_min={this.sen_min} 
						sen_max={this.sen_max} 
						sen_mid_point={this.sen_mid_point}
						allSenHist={this.allSenHist}
			/>
		</div>
    );
  }
}

export default OutputCharts;
