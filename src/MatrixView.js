import React, { Component } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        let mIndex = ['m1','m2','m3','m4'];
        let svgThumbnail = d3.selectAll('.matrixChoose')
            .data(mIndex)
            .attr('id',d=>d)
            .attr("viewBox", `0 0 100 100`);
        svgThumbnail.append('rect')
            .attr('width','100%')
            .attr('height','100%')
            .style('fill','red');
        svgThumbnail.on('click',function(d,i){
            let url = 'http://127.0.0.1:5000/matrix/'+d;
            axios.get(url)
                .then(res=>{
                  console.log(res.data);
                });
        });

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