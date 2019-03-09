import React, { Component } from 'react';

class MatrixView extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        return (
            <div>
                <div 
                    style={{
                        width: '20vw',
                    }}
                    className='block'
                >

                </div>
                <div 
                    style={{
                        width: '77vw',
                    }}
                    className='block'
                >

                </div>
            </div>
        );
    }
}

export default MatrixView;