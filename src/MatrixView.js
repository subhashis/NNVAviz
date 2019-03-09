import React, { Component } from 'react';
import axios from 'axios';
import colorbrewer from 'colorbrewer';
import * as d3 from 'd3';
import m1_thumb from './assets/m1_128.png';
import m2_thumb from './assets/m2_128.png';
import m2 from './assets/m2.png';
import m3_thumb from './assets/m3_128.png';
import m3 from './assets/m3.png';
import m4_thumb from './assets/m4_128.png';
import $ from 'jquery';

class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        let mIndex = ['m1','m2','m3','m4'];
        let thumbnail = d3.selectAll('.matrixChoose')
            .data(mIndex)
            .attr('id',d=>d);
        thumbnail.on('click',function(d,i){
            let url = 'http://127.0.0.1:5000/matrix/'+d;
            axios.get(url)
                .then(res=>{drawMatrix(res.data,d)});
        });
        let drawMatrix = (data,type)=>{
            console.log(data)
            $('#matrix').empty()
            let dy,dx;
            if (type ==='m1'){
                dy = 35
                dx = 1024
            }
            else if (type === 'm2'){
                dy = 1024
                dx = 800
                $('#matrix').append('<img src='+m2+' width="100%" alt="m2" />');
                return 0;
            }
            else if (type === 'm3'){
                dy = 800
                dx = 500
                $('#matrix').append('<img src='+m3+' width="100%" alt="m2" />');
                return 0;
            }
            else if (type === 'm4'){
                dy = 500
                dx = 400
            }
            let svgMatrix = d3.select('#matrix')
                .append('svg')
                .attr("viewBox", `0 0 2000 900`);
            const margin = 0
            const width = (2000-margin*2)/dx
            const height = (900-margin*2)/dy
            const paletteName = 'RdBu';
            let colors = colorbrewer[paletteName][11];
            colors = colors.slice(0).reverse();
            let max = data[0][0]
            let min = data[0][0]
            for (let i = 0;i<dy;i++){
                for(let j=0;j<dx;j++){
                    if (max<data[i][j]) max = data[i][j];
                    else if (min>data[i][j]) min = data[i][j];
                }
            }
            let dom = [];
            for (let i = 0; i < 11; i += 1) {
                dom.push(min + i * (max-min) / 10);
            }
            let colorScale = d3.scaleLinear().domain(dom).range(colors);
            svgMatrix.selectAll('.my').data(data)
                .enter()
                .append('g')
                .attr('id',(d,i)=>{return 'y'+i})
                .attr('class','my')
                .each(function(d,i){
                    let group = d3.select('g#y'+i).selectAll('rect')
                    group.data(d)
                        .enter()
                        .append('rect')
                        .attr('x',(d,i)=>{return margin+width*i})
                        .attr('width',width)
                        .attr('y',(d)=>{return margin+height*i})
                        .attr('height',height)
                        .style('fill',(d)=>{return colorScale(d)})
                        .style('stroke','none')
                        .style('stroke-width','0px')
                })
        }

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
                    <img className = 'matrixChoose' src={m1_thumb} alt='m1_thumb'></img>
                    <img className = 'matrixChoose' src={m2_thumb} alt='m2_thumb'></img>
                    <img className = 'matrixChoose' src={m3_thumb} alt='m3_thumb'></img>
                    <img className = 'matrixChoose' src={m4_thumb} alt='m4_thumb'></img>
                </div>
                <div 
                    style={{
                        width: '87vw',
                        height: '40vw',
                    }}
                    className='block'
                >
                    <div id = 'matrix'></div>
                </div>
            </div>
        );
    }
}

export default MatrixView;