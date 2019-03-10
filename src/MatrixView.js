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
import m4 from './assets/m4.png';
import Slider from 'rc-slider';
import $ from 'jquery';

class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {type:undefined};
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
            this.setState({
                type:type,
                data: data,
            }) 
        }
    }
    componentDidUpdate(prevProps,prevState){
        let type = this.state.type;
        let data = this.state.data;
        let dy,dx;
        if(prevState.type==='m1') $('#mt-body-m1').remove();
        if(prevState.type==='m4') $('#mt-body-m4').remove();
        if (type ==='m1'){
            dy = 35
            dx = 1024
            let svgMatrix = d3.select('#mt-body')
                .append('div')
                .attr('id','mt-body-m1')
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
            let sorted = [];
            for (let i =0;i<dy;i++){
                sorted.push(data[i].slice(0).sort((a,b)=>(a-b)));
            }
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
                })
            
            svgMatrix.on('contextmenu',function(d,i){
                d3.event.preventDefault();
                svgMatrix.selectAll('.my').data(sorted)
                    .each((d,i)=>{
                        let group = d3.select('g#y'+i).selectAll('rect')
                        group.data(d)
                        .style('fill',(d)=>{return colorScale(d)})
                    })
            })
            let tooltip = d3.select('#mt-body-m1')
                .append("div")
                .style("position", "absolute")
                .style("visibility", "hidden");
        
            svgMatrix.selectAll('.my')
                .on('mouseover',(d,i)=>{
                    $('#svgTool').empty()
                    tooltip.html('<div class="heatmap_tooltip"><svg id = "svgTool"></svg></div>');
                    let svgTool=d3.select('#svgTool')
                    svgTool.attr('width','100%').attr('height','100%')
                        .attr("viewBox", `0 0 100 100`);
                    tooltip.style("visibility", "visible")
                })
                .on('mouseout',(d,i)=>{
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function(d, i) {
                    
                    let y = d3.event.pageY;
                    if(d3.event.clientY>750) y-=200;
                    let x = d3.event.pageX + 20;
                    tooltip.style("top", y + "px").style("left", x + "px");
                })
        }
        else if (type === 'm4'){
            dy = 500
            dx = 400
        }
    }
    render(){
        let w1,w2,w3,w4,content;
        const type = this.state.type;
        w1 = null;
        w2 = <img src={m2} alt="m2" className = "full" />;
        w3 = <img src={m3} alt="m2" className = "full" />;
        w4 =<div id = "mt-body-m4" >
                <img src={m4} alt="m4" class ="half"/>
                <div id ="mt-slider" >
                    <Slider 
                        vertical = {true}
                    />
                </div>
                <div id ="mt-sen">
                </div>
            </div>
        if(type==='m1') content = w1;
        else if (type === 'm2') content = w2;
        else if (type === 'm3') content = w3;
        else if (type === 'm4') content = w4;
        else content = null;
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
                        padding: '0.5vw',
                    }}
                    className='block'
                    id = 'matrix'
                >
                    <div id = 'mt-title'></div>
                    <div id = 'mt-body'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

export default MatrixView;