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
            
            if(type === 'm1'){
                svgMatrix.on('contextmenu',function(d,i){
                    d3.event.preventDefault();
                    svgMatrix.selectAll('.my').data(sorted)
                        .each((d,i)=>{
                            let group = d3.select('g#y'+i).selectAll('rect')
                            group.data(d)
                            .style('fill',(d)=>{return colorScale(d)})
                        })
                })
                let tooltip = d3.select('#matrix')
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
                
                // svgMatrix.selectAll('.my')
                //     .on('click',(d,i)=>{
                //     //append pop window if not visible
                //     $('svg.pop').remove();
                //     let pop = d3.select('#matrix').append('svg')
                //         .attr('class','pop')
                //         .attr("viewBox", `0 0 160 90`)
                //     pop.append('rect')
                //         .attr('width','100%')
                //         .attr('height','100%')
                //         .style('fill','white')
                //         .on('click',()=>{$('svg.pop').remove();})

                //     let x = d3.scaleLinear()
                //         .domain([min, max])
                //         .range([10,150]);
                    
                //     let max_den,min_den;
                //     if (type ==='m1'){
                //         max_den = 0.11
                //         min_den = 0.09
                //     }
                //     else if (type ==='m4'){
                //         max_den = 0.11
                //         min_den = 0.08
                //     }
                //     let y = d3.scaleLinear()
                //         .domain([min_den,max_den])
                //         .range([70,5]);

                //     pop.append("g")
                //         .attr("class", "axis axis--x")
                //         .attr("transform", "translate(0,70)")
                //         .call(d3.axisBottom(x).tickSize(2))

                //     pop.append("g")
                //         .attr("class", "axis axis--y")
                //         .attr("transform", "translate(10,0)")
                //         .call(d3.axisLeft(y).tickSize(1).ticks(null, "%"));
                //     d3.selectAll('.tick').select('text')
                //         .style('font-size','2px');
                    
                //     let density = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))(d);
                //     console.log(density);
                //     pop.append('path')
                //         .datum(density)
                //         .style("fill", "none")
                //         .style("stroke", "#000")
                //         .style("stroke-width", '0.4')
                //         .style("stroke-linejoin", "round")
                //         .attr("d",  d3.line()
                //             .curve(d3.curveBasis)
                //             .x(function(d) { return x(d[0]); })
                //             .y(function(d) { return y(d[1]); })
                //         )
                    
                //     const margin = 10
                //     const width = (160-margin*2)/dx
                //     const height =8
                //     pop.selectAll('rect.bar')
                //         .data(d).enter()
                //         .append('rect')
                //         .attr('x',(d,i)=>{return margin+width*i})
                //         .attr('width',width)
                //         .attr('y','80')
                //         .attr('height',height)
                //         .style('fill',(d)=>{return colorScale(d)})
                // })
            }
        }

        function kernelDensityEstimator(kernel, X) {
            return function(V) {
                return X.map(function(x) {
                    return [x, d3.mean(V, function(v) { return kernel(x - v); })];
                });
            };
          }
          
        function kernelEpanechnikov(k) {
            return function(v) {
                return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
            };
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