import React, { Component } from 'react';
import Parameter from './Parameter';
import Preview from './Preview';

export default class InputCharts extends Component {
	constructor(props){
        super(props);
    }
    render(){
        return (
            <div id="inputs" >
                <Parameter />
                {/* <Preview /> */}
		    </div>
        )
    }
}