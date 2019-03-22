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

function importAll(r) {
    return r.keys().map(r);
}



class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {type:undefined};
        this.images = importAll(require.context('./data/weight_distribution_images/', false, /\.(png|jpe?g|svg)$/))
    }

    componentDidMount(){
        let mIndex = ['m1','m2','m3','m4'];
        let thumbnail = d3.selectAll('.matrixChoose')
            .data(mIndex)
            .attr('id',d=>d);
        thumbnail
            .on('click',function(d,i){
                let url = 'http://127.0.0.1:5000/matrix/'+d;
                axios.get(url)
                    .then(res=>{drawMatrix(res.data,d)});
            })

        let drawMatrix = (data,type)=>{
            this.setState({
                type:type,
                data: data,
            }) 
        }
    }
    componentDidUpdate(prevProps,prevState){
        if(this.state.type === prevState.type) return 0
        let type = this.state.type;
        let data = this.state.data;
        let dy,dx;
        const paletteName = 'RdBu';
        let colors = colorbrewer[paletteName][11];
        colors = colors.slice(0).reverse();
        let colorScale;
        if(prevState.type==='m1') $('#mt-body-m1').remove();
        if(prevState.type==='m4') $('#mt-body-m4').remove();
        if (type ==='m1'){
            dy = 35
            dx = 1024
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
            colorScale = d3.scaleLinear().domain(dom).range(colors);
            let svgMatrix = d3.select('#mt-body')
                .append('div')
                .attr('id','mt-body-m1')
                .append('svg')
                .style('height','100%')
                .style('width','100%')
                .attr('preserveAspectRatio',"none")
                .attr("viewBox", `0 0 2000 900`);
            const margin = 100
            const width = (2000-margin)/dx
            const height = (900)/dy
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
                        .attr('y',(d)=>{return height*i})
                        .attr('height',height)
                        .style('fill',(d)=>{return colorScale(d)})
                })
            let label = svgMatrix.append('g')
            label.selectAll('text')
                .data(this.props.paraName)
                .enter()
                .append('text')
                .text(d=>d)
                .style('text-anchor','end')
                .style('dominant-baseline','hanging')
                .attr('x',margin)
                .attr('y',(d,i)=>height*i)
            
            svgMatrix.on('contextmenu',function(d,i){
                d3.event.preventDefault();
                if(!this.sorted){
                    svgMatrix.selectAll('.my').data(sorted)
                        .each((d,i)=>{
                            let group = d3.select('g#y'+i).selectAll('rect')
                            group.data(d)
                            .style('fill',(d)=>{return colorScale(d)})
                        })
                    this.sorted = true;
                }
                else {
                    svgMatrix.selectAll('.my').data(data)
                        .each((d,i)=>{
                            let group = d3.select('g#y'+i).selectAll('rect')
                            group.data(d)
                            .style('fill',(d)=>{return colorScale(d)})
                        })
                    this.sorted = false;
                }
                
            })
            let tooltip = d3.select('#mt-body-m1')
                .append("div")
                .style("position", "absolute")
                .style("visibility", "hidden");
        
            svgMatrix.selectAll('.my')
                .on('mouseover',(d,i)=>{
                    $('#svgTool').empty()
                    tooltip.html(`<div class="heatmap_tooltip"><img src=${this.images[i]}></div>`);
                    tooltip.style("visibility", "visible")
                })
                .on('mouseout',(d,i)=>{
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function(d, i) {
                    
                    let y = d3.event.pageY;
                    if(d3.event.screenY>750) y-=270;
                    let x = d3.event.pageX + 20;
                    tooltip.style("top", y + "px").style("left", x + "px");
                })
        }
        else if (type === 'm2'){
            dy = 1024
            dx = 800
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
            colorScale = d3.scaleLinear().domain(dom).range(colors);
        }
        else if (type === 'm3'){
            dy = 800
            dx = 500
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
            colorScale = d3.scaleLinear().domain(dom).range(colors);
        }
        else if (type === 'm4'){
            dy = 500
            dx = 400
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
            colorScale = d3.scaleLinear().domain(dom).range(colors);
            d3.select('#mt-index')
                .attr('viewBox','0 0 100 536')
            
            let scaler = d3.scaleLinear().domain([0,499]).range([0,536])     
            d3.select('#mt-index').append('path')
                .attr('d',`m0 ${scaler(250)} l100 0 m-100 0 l5 5 m-5 -5 l5 -5`)
                .attr('stroke','black')
                .style('stroke-width','1')
            d3.select('#mt-index').append('text')
                .text('250')
                .style('text-anchor','middle')
                .style('dominant-baseline','hanging')
                .attr('x',50)
                .attr('y',scaler(250))
            let url = 'http://127.0.0.1:5000/matrix/mp';
            axios.get(url)
                .then(res=>{
                    let svg = d3.select('#mt-sen')
                        .append('svg')
                        .style('height','100%')
                        .style('width','100%')
                        .attr('preserveAspectRatio',"none")
                        .attr('viewBox','0 -15 456 489')
                        // .attr('viewBox','0 0 456 489') // this is original one

                    // expend data
                    const data_height = 89;
                    const data_width = 456/400;
                    svg.append('g').selectAll('rect.expend')
                        .data(this.state.data[250])
                        .enter()
                        .append('rect')
                        .attr('class','expend')
                        .attr('x',(d,i)=>i*data_width)
                        .attr('width',data_width)
                        .attr('y',400)
                        .attr('height',data_height)
                        .style('fill',d=>colorScale(d))

                    this.sen = res.data;
                    const margin_top = 30
                    const margin_left = 30
                    const margin_bottom = 60
                    const margin_right = 5
                    const width = 456-margin_left-margin_right
                    const height = 400-margin_top-margin_bottom
                    let x = d3.scaleLinear().domain([0,35]).range([margin_left,456-margin_right])
                    let y = d3.scaleLinear().domain([0,1]).range([height,0])
                    let bar_g = svg.append('g')
                    bar_g.selectAll('rect.bar')
                        .data(this.sen[250])
                        .enter()
                        .append('rect')
                        .attr('class','bar')
                        .attr('x',(d,i)=>x(i))
                        .attr('width',width/35)
                        .attr('y',d=>margin_top+y(d))
                        .attr('height',d=>height-y(d))
                        .style('fill','CadetBlue')
                    let tmp = []
                    for (let i=0.5;i<35;i++){
                        tmp.push(i)
                    }
                    let x_axis = d3.axisBottom(x).tickValues(tmp).tickSizeOuter(0)
                    bar_g.append("g")
                        .attr("transform", "translate(0," + (height + margin_top) + ")")
                        .call(x_axis)
                        .selectAll('.tick')
                        .select('text')
                        .data(this.props.paraName)
                        .text(d=>d)
                        .style('text-anchor','end')
                        .style('transform','rotate(-90deg) translate(-7px,-1.2em)')
                    let y_axis = d3.axisLeft(y)
                    bar_g.append("g")
                        .attr("transform", `translate(${margin_left},${margin_top})`)
                        .call(y_axis)
                    bar_g.selectAll('.tick')
                        .select('line')
                        .attr('stroke','black')
                        .style('stroke-width','1')
                    bar_g.selectAll('.domain')
                        .attr('stroke','black')
                        .style('stroke-width','1')
                    bar_g.append('text')
                        .text('Parameter Importance')
                        .style('text-anchor','middle')
                        .style('dominant-baseline','hanging')
                        .attr('x',456/2)
                });
        }
        this.colorScale = colorScale;
        // legend
        let svg = d3.select('#mt-legend').select('svg')
        const width = 2215/11
        const height = 30
        svg.selectAll('rect')
            .data(colorScale.domain()).enter().append('rect')
            .attr('x',(d,i)=>width*i)
            .attr('y',0)
            .attr('width',width)
            .attr('height',height)
            .style('fill',d=>colorScale(d))
        svg.selectAll('text')
            .data(colorScale.domain()).enter().append('text')
            .attr('x',(d,i)=>width*i+width/2)
            .attr('y',35)
            .style('text-anchor','middle')
            .style('dominant-baseline','hanging')
            .text(d=>d.toFixed(1))
            .style('font-size','3vw')
            .style('visibility',(d,i)=>{
                if (i%5===0) return 'visible'
                else return 'hidden'
            })
        svg.selectAll('text')
            .data(colorScale.domain())
            .text(d=>d.toFixed(1))
    }
    drawBarChart(value){
        value = 499-value;
        let svg = d3.select('#mt-sen').select('svg')
        svg.selectAll('rect.expend')
            .data(this.state.data[value])
            .style('fill',d=>this.colorScale(d))
        const margin_top = 30
        const margin_left = 30
        const margin_bottom = 60
        const margin_right = 5
        const width = 456-margin_left-margin_right
        const height = 400-margin_top-margin_bottom
        let x = d3.scaleLinear().domain([0,35]).range([margin_left,456-margin_right])
        let y = d3.scaleLinear().domain([0,1]).range([height,0])
        svg.selectAll('rect.bar')
            .data(this.sen[value])
            .attr('x',(d,i)=>x(i))
            .attr('width',width/35)
            .attr('y',d=>margin_top+y(d))
            .attr('height',d=>height-y(d))
    }
    moveSlider(value){
        value = 499-value;
        let scaler = d3.scaleLinear().domain([0,499]).range([0,536]) 
        d3.select('#mt-index').select('path')
            .attr('d', `m 0,${scaler(value)} l 100,0 m -100,0 l 5,5 m -5,-5 l 5,-5`)
        d3.select('#mt-index').select('text')
            .text(value)
            .attr('x',50)
            .attr('y',scaler(value))
        d3.select('#mt-index').select('text')
            .style('dominant-baseline',()=>{return value>450?'auto':'hanging'})
    }
    render(){
        let w1,w2,w3,w4,content=null,title=null;
        const type = this.state.type;
        w1 = null;
        w2 = <img src={m2} alt="m2" className = "full" />;
        w3 = <img src={m3} alt="m2" className = "full" />;
        w4 =<div id = "mt-body-m4" >
                <img src={m4} alt="m4" className ="half"/>
                <svg className='left' id ='mt-index'></svg>
                <div id ="mt-slider-div" >
                    <Slider 
                        vertical = {true}
                        onChange = {this.moveSlider}
                        onAfterChange = {value=>this.drawBarChart(value)}
                        trackStyle={{
                            backgroundColor: '#cccccc',
                        }}
                        railStyle={{
                            backgroundColor: '#cccccc',
                        }}
                        handleStyle={{
                            borderColor: '#4d4d4d',
                        }}
                        min={0}
                        max={499}
                        defaultValue={249}
                        step={1}
                    />
                </div>
                <div id ="mt-sen">
                </div>
            </div>
        if(type==='m1') {
            content = w1;
            title = 'Weight Matrix 1 (35 X 1024)'
        }
        else if (type === 'm2') 
        {
            content = w2;
            title = 'Weight Matrix 2 (1024 X 800)'
        }
        else if (type === 'm3') {
            content = w3;
            title = 'Weight Matrix 3 (800 X 500)'
        }
        else if (type === 'm4') {
            content = w4;
            title = 'Weight Matrix 4 (500 X 400)'
        }
        return (
            <div>
                <div 
                    style={{
                        width: '97vw',
                        textAlign: 'center',
                    }}
                    className='block title'
                >NN Analyze</div>
                <div 
                    style={{
                        width: '10vw',
                        height: '40vw',
                        padding:'0.8vw',
                    }}
                    className='block'
                >
                    <div className = 'matrixChoose grow'>
                        <div className = 'vertical-text'>35</div>
                        <img className = 'part' src={m1_thumb} alt='m1_thumb'></img>
                        <div className = 'corner-text'>W1</div>
                        <div className = 'center-text'>1024</div>
                    </div>
                    <div className = 'matrixChoose grow'>
                        <div className = 'vertical-text'>1024</div>
                        <img className = 'part' src={m2_thumb} alt='m2_thumb'></img>
                        <div className = 'corner-text'>W2</div>
                        <div className = 'center-text'>800</div>
                    </div>
                    <div className = 'matrixChoose grow'>
                        <div className = 'vertical-text'>800</div>
                        <img className = 'part' src={m3_thumb} alt='m3_thumb'></img>
                        <div className = 'corner-text'>W3</div>
                        <div className = 'center-text'>500</div>
                    </div>
                    <div className = 'matrixChoose grow'>
                        <div className = 'vertical-text'>500</div>
                        <img className = 'part' src={m4_thumb} alt='m4_thumb'></img>
                        <div className = 'corner-text'>W4</div>
                        <div className = 'center-text'>400</div>
                    </div>
                </div>
                <div 
                    style={{
                        width: '87vw',
                        height: '40vw',
                        padding: '0.8vw',
                    }}
                    className='block'
                    id = 'matrix'
                >
                    <div id = 'mt-title' className='title'>{title}</div>
                    <div id = 'mt-legend'>
                        <svg viewBox='0 0 2215 100'></svg>
                    </div>
                    <div id = 'mt-body'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

export default MatrixView;