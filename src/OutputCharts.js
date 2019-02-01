import React, { Component } from 'react';
import * as d3 from 'd3';
import CellChart from './CellChart';
import HeatChart from './HeatChart';

class OutputCharts extends Component {
	constructor(props){
		super(props);
		// this.state = {
		// 	selectV: [],
		// }
		this.valueLen = 400;
		this.selectV = [];
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
				<HeatChart radius={150} size={400} />
				<div id='bar'>Plan to put the vertical bars here:</div>
			</div>
    );
  }
}

export default OutputCharts;
