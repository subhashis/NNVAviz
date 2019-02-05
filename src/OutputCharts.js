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

	updateSelection() {
		//TODO: change this part to state
		const valueLen = this.valueLen;
		const selectV = this.selectV;
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

		// draw mask
		let mask = d3.select('div#mychart2').select('svg').select('#mask');
		let sA = Math.PI*2*start/400+Math.PI;
		let eA = Math.PI*2*end/400+Math.PI;
		if(eA>sA) eA-=Math.PI*2;

		
		mask.attr('d',d3.arc().innerRadius(50).outerRadius(35*3+50).startAngle(eA).endAngle(sA));


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

		this.add_select = add_select;
		this.sub_select = sub_select;
		this.selectV = new_selectV;
	
		// regeister animation
		this.ani = requestAnimationFrame(this.updateSelection.bind(this));
	}

	brushStart(){
		console.log('brush started');
		if(this.selectionStarted)
			for(const index of this.selectV){
				$('.circular-heat').append($(`path.heat.v${index}`));
			}
		else this.selectionStarted = true;
		this.ani = this.updateSelection();
	}
	brushEnd(){
		console.log('brush ended');
		cancelAnimationFrame(this.ani);
		const selectV = this.selectV;
		// shadow effect
		for (const index of selectV){
			$('#selectedHeat').append($(`path.heat.v${index}`));
		}

		// update bar chart
		let bar_svg = d3.select("#bar_svg");
		let bar_h = parseInt( bar_svg.style("height"), 10 )/35;
    	let bar_w = parseInt( bar_svg.style("width"), 10 );

		let partialMax = 0;
		for( let i = 0; i < 35; i++ ){
			let sum = 0;
			let index = i * 400 + selectV[0];
			for( let j = 0; j<selectV.length; j++ ){
				sum += this.sen_data[index + j].value;
			}
			this.allSenHist[i].partV = sum;//parseFloat(sum /selectV.length);
			if( partialMax < this.allSenHist[i].partV ){
				partialMax = this.allSenHist[i].partV
			}
		}
		partialMax = partialMax<=0?1:partialMax

		bar_svg.selectAll("#partial")
		.data(this.allSenHist)
		.transition().duration(750)
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + ((i+0.5)*bar_h-1) + ")"; } )
		.attr("width", function(d) { 
			return (d.partV/partialMax)*bar_w; 
		})
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
		<div id="outputs">
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
