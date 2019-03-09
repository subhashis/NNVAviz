import React, { Component } from 'react';
import * as d3 from 'd3';

class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        d3.selectAll('.matrixChoose')
            .attr("viewBox", `0 0 100 100`)
            .append('rect')
            .attr('width','100%')
            .attr('height','100%')
            .style('fill','red');
    }
    render(){
        return (
            <div>
                <div 
                    style={{
                        width: '10vw',
                        height: '40vw',
                    }}
                    className='block'
                >
                    <svg className = 'matrixChoose'></svg>
                    <svg className = 'matrixChoose'></svg>
                    <svg className = 'matrixChoose'></svg>
                    <svg className = 'matrixChoose'></svg>
                </div>
                <div 
                    style={{
                        width: '87vw',
                        height: '40vw',
                    }}
                    className='block'
                >

                </div>
            </div>
        );
    }
}

export default MatrixView;