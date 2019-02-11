import React, { Component } from 'react';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css'

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
        let p={};
        for (let i in this.state.paraS){
            p['p'+i]=this.state.paraS[i];
        }
        this.props.run('http://127.0.0.1:5000/',p);
    }
    render(){
        let sliders = [];
        for (let i=0;i<35;i++){
            let hsC = this.handleSliderChange;
            sliders.push(
                <div key ={i} className='slider'>
                    {`P${i}:`}
                    <input id={i} className='paraBox' type="text" value={this.state.para[i]} onChange={this.handleInputChange} />
                    <Slider 
                        vertical={true} 
                        min={-1}
                        max={1}
                        index={i}
                        defaultValue={0}
                        value={this.state.paraS[i]}
                        onChange={function(value){hsC(value,this)}}
                        // marks={{ 0.1: 'current', 0.3: 0.2, 0.12: 0.4 }}
                        step={0.005}
                        handle={handle}
                    />
                </div>
                );
        }
        return (
            <div id = 'sliders'>
                {sliders}
                <button className="btn btn-primary" onClick={()=>this.handleRunClick()} >Run</button><br></br>
                <button className="btn btn-primary">Save</button><br></br>
                <button className="btn btn-primary">Export</button><br></br>
                <div id = 'saved'>
                    <p>Saved Lines</p>
                </div>
            </div>
        );
    }
}