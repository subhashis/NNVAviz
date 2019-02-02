import React, { Component } from 'react';
import * as d3 from 'd3';
import CellChart from './CellChart';
import HeatChart from './HeatChart';
import BarChart from './barChart';
import data from './data/1/NNVA_data';

class OutputCharts extends Component {
	constructor(props){
		super(props);
		// this.state = {
		// 	selectV: [],
		// }
		this.valueLen = 400;
		this.selectV = [];
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
		let add_select=[]; //additional element comapared to old selection
		let sub_select=[]; //canceled element compared to old
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
		// calculate add and sub selection
		let i1=0, i2=0;
		new_selectV.sort((a,b)=>{return a-b});
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
	
		// this.setState({
		// 	selectV: new_selectV,
		// });
		this.selectV = new_selectV;
	
		for(const index of add_select){
			d3.selectAll(`path.heat.v${index}`)
				.attr('opacity','1');
		}
	
		for(const index of sub_select){
			d3.selectAll(`path.heat.v${index}`)
				.attr('opacity','0.1');
		}

		console.log( sub_select )
 
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
		console.log(selectV.length)
		console.log(this.allSenHist);
		console.log(bar_h)
		console.log(bar_w)
		console.log(partialMax)


		bar_svg.selectAll("#partial")
		.data(this.allSenHist)
		.transition().duration(750)
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + (i*bar_h+3) + ")"; } )
		.attr("width", function(d) { 
			// console.log((d.partV/partialMax)*bar_w);
			// return (d.partV/partialMax)*bar_w; 
			console.log((d.partV)*bar_w);
			return (d.partV)*bar_w; 
		})
		.attr("height", function(d) { return 5 })//bar_h-6; })
		.attr("fill", 'red')
		.attr("opacity", 0.7);

		// regeister animation
		this.ani = requestAnimationFrame(this.updateSelection.bind(this));
	}

	brushStart(){
		console.log('brush started');
		this.ani = this.updateSelection();
	}
	brushEnd(){
		console.log('brush ended');
		cancelAnimationFrame(this.ani);
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
