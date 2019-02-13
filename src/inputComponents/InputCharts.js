import React, { Component } from 'react';
import Parameter from './Parameter';
import Preview from './Preview';

export default class InputCharts extends Component {
    render(){
        return (
            <div id="inputs" >
                <Parameter 
                    run = {this.props.request}
                />
                <Preview 
                    previewData = {this.props.previewData}
                    radius={150} 
                    size={400} 
                    valueLen={400}
                />
		    </div>
        )
    }
}