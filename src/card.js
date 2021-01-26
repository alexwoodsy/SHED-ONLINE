import React from 'react';
import { Rect } from 'react-konva';

const cardComponent = (props) => {
    return <Rect
        x={props.x} 
        y={props.y} 
        width={100} 
        height={140}
        fill={'red'}
        shadowBlur={10}
    />
};

export default cardComponent
