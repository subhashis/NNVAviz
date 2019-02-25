import React, { Component } from 'react';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
// import $ from 'jquery';

const Handle = Slider.Handle;
const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  };

export default class Parameters extends Component {
    constructor(props){
        super(props);
        this.state={};
        let para = [];
        let paraS = [];
        for (let i=0;i<35;i++){
            para.push('0');
            paraS.push(0);
        }
        this.state.para = para;  //string
        this.state.paraS = paraS; //number
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.state.data = []; //hold p0-p34 and preData
    }

    handleInputChange(event){
        const id = event.target.id;
        const value = event.target.value;
        let new_para = this.state.para.slice(0);
        let new_paraS = this.state.paraS.slice(0);
        new_para[id]= value;
        new_paraS[id]= parseFloat(value);
        this.setState({para: new_para, paraS: new_paraS});
    }

    handleSliderChange(value,obj){
        const id = obj.index;
        let new_para = this.state.para.slice(0);
        let new_paraS = this.state.paraS.slice(0);
        new_paraS[id]= parseFloat(value);
        new_para[id]= ""+value;
        this.setState({para: new_para, paraS: new_paraS});
    }

    handleRunClick(){
        this.p={};
        for (let i in this.state.paraS){
            this.p['p'+i]=this.state.paraS[i];
        }
        this.props.run('http://127.0.0.1:5000/prev',this.p);
    }

    handleSaveClick(){
        if (this.p){
            // if run is ever clicked
            this.p.data = this.props.previewData;
            let new_data = this.state.data.slice(0);
            new_data.push(this.p);
            this.setState({data:new_data});
        }
    }

    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }

    handleExportClick() {
        this.download('test',JSON.stringify(this.state.data));
    }
    handleImportClick() {
        var fileInput = document.getElementById('fileInput');
        let file = fileInput.files[0];

        let reader = new FileReader();

        reader.onload = (e) => {
            let data = JSON.parse(reader.result);
            this.setState({data:data});
        }
        reader.readAsText(file);
    }

    render(){
        let sliders = [];
        for (let i=0;i<35;i++){
            let hsC = this.handleSliderChange;
            sliders.push(
                <div key ={i} className='slider'>
                    <div className='sliderText'>
                        {`P${i}:`}<br></br>
                        <input id={i} className='paraBox' type="text" value={this.state.para[i]} onChange={this.handleInputChange} />
                    </div>
                    <div className='sliderBody'>
                        <Slider 
                            vertical={true} 
                            min={-1}
                            max={1}
                            index={i}
                            defaultValue={0}
                            value={this.state.paraS[i]}
                            onChange={function(value){hsC(value,this)}}
                            trackStyle={{
                                backgroundColor: '#e9e9e9',
                            }}
                            step={0.005}
                            handle={handle}
                        />
                    </div>
                    <div className='sliderBody'>
                        <Slider 
                            vertical={true}
                            min={-1}
                            max={1}
                            index={i}
                            defaultValue={0}
                            value={this.state.paraS[i]}
                            onChange={function(value){hsC(value,this)}}
                            trackStyle={{
                                backgroundColor: '#e9e9e9',
                            }}
                            marks={this.props.marks[i]}
                            step={0.005}
                            handleStyle={{
                                visibility: 'hidden',
                            }}
                            dotStyle={{
                                borderColor: '#abe2fb',
                            }}
                        />
                    </div>
                </div>
                );
        }
        
        
        let columns = [];
        // const width = $(window).width()*0.78/35;
        for (let i =0 ;i<35;i++){
            const temp = {
                Header: `P${i}`,
                accessor: `p${i}`,
                // width: width,
            }
            columns.push(temp);
        }
        
        return (
            <div id = 'sliders'>
                {sliders}
                <div id='controls'>
                    <button className="btn btn-primary btn-sm" onClick={()=>this.handleRunClick()} >Run</button><br></br>
                    <button className="btn btn-primary btn-sm" onClick={()=>this.handleSaveClick()} >Save</button><br></br>
                    <button className="btn btn-primary btn-sm" onClick={()=>this.handleExportClick()} >Export</button><br></br>
                    <label className="btn btn-primary btn-sm">
                        Import <input type="file" id="fileInput" onChange={()=>this.handleImportClick()} />
                    </label><br></br><br></br>
                </div>
                
                <ReactTable
                    data={this.state.data}
                    columns={columns}
                    defaultPageSize={5}
                    getTdProps={(state, rowInfo, column, instance) => {
                        return {
                          onClick: (e, handleOriginal) => {
                                if (rowInfo){
                                    let d = this.state.data[rowInfo.index];
                                    this.props.tableClick(d.data);
                                    let para=[];
                                    let paraS = [];
                                    for (let i =0 ;i<35;i++){
                                        paraS.push(d['p'+i]);
                                        para.push(d['p'+i].toString());
                                    }
                                    this.setState({para: para, paraS: paraS});
                                }
                    
                                // IMPORTANT! React-Table uses onClick internally to trigger
                                // events like expanding SubComponents and pivots.
                                // By default a custom 'onClick' handler will override this functionality.
                                // If you want to fire the original onClick handler, call the
                                // 'handleOriginal' function.
                                if (handleOriginal) handleOriginal();
                            }
                        };
                    }}
                />
            </div>
        );
    }
}