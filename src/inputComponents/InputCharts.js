import React, { Component } from 'react';
import Parameter from './Parameter';
import Preview from './Preview';

export default class InputCharts extends Component {
    constructor(props){
        super(props);
        this.state={};
    }
    handleTableClick(data){
        console.log(data);
        this.setState({previewData:data});
    }
    render(){
        return (
            <div id="inputs" >
                <Parameter 
                    run = {this.props.request}
                    previewData = {this.props.previewData}
                    tableClick = {(d)=>{this.handleTableClick(d)}}
                    marks = {this.props.marks}
                />
                <Preview 
                    previewData = {this.state.previewData?this.state.previewData:this.props.previewData}
                    radius={150} 
                    size={400} 
                    valueLen={400}
                />
		    </div>
        )
    }
}