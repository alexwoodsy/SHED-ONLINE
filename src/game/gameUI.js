import React from "react"; //, { useEffect, useState }
import { Image } from 'react-konva';
import useImage from 'use-image';
//magic
import burn from '../images/magicEvents/burn.png'
import invisible from '../images/magicEvents/Invis.png'
import HighOrLow from '../images/magicEvents/HighOrLow.png'
import reset from '../images/magicEvents/reset.png'
//ui
import wood from '../images/UI/wood.png'
//benchui
import benchReady from '../images/UI/BenchReady.png'
import benchUnready from '../images/UI/BenchUnready.png'
//sevenchoices
import higherArrow from '../images/magicEvents/HigherArrow.png'
import lowerArrow from '../images/magicEvents/LowerArrow.png'


const MagicImages = {
  burn: burn,
  invisble: invisible,
  highOrLow: HighOrLow,
  reset: reset,
  wood: wood,
}

function imageRatio (image) {
  //scale image
  let imgRatio=1; //inni to 1 ao image still renders
  if (image !== undefined) {
    imgRatio = image.width/image.height
  }
  return imgRatio //default
}

const MagicImage = (props) => {
  let magicEvent = props.magicEvent;
  let img;
  switch (magicEvent.type) {
    case 'burning': 
      img = MagicImages.burn
      break;
    case 'Invisible':
      img = MagicImages.invisble
      break;
    case 'reset':
      img = MagicImages.reset
      break;
    case 'Higher or lower':
      img = MagicImages.highOrLow
      break;
    default: 
    img = MagicImages.wood
    break;
  }

  const [image] = useImage(img);
  let scale = props.scale*30
  let width = scale*imageRatio(image);
  let height = scale;
  let x = props.x - width/2;
  let y = props.y - height/2;

  
  return (
    <Image 
        image={image} 
        x={x} 
        y={y}
        width={width} 
        height={height}
        shadowBlur={props.shadowBlur} 
    />
  )
}



//BenchReadyButton - need this for doing these





export class MagicEvent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        renderMagic: true,
      }
      
      this.interval = null;
    }

    getMagicEvent = () => {
        let magicEvent = this.props.magicEvent
        let magicCheck = magicEvent.type !== null

        this.setState({
            renderMagic: magicCheck
        })
            
        this.interval = setTimeout(() => this.setState({renderMagic: false}), 1500);
    }
    
    componentDidMount() {
        this.getMagicEvent()
        
    }
        
    componentWillUnmount() {
      clearInterval(this.interval);
    }  

    componentDidUpdate (prevProps) {
      
        if (this.props.magicEvent.type !== prevProps.magicEvent.type) {
          //console.log('prev', prevProps, 'curr', this.props)
            this.setState({renderMagic: true})
            this.getMagicEvent()
        }

    }
        
    render() {
        
      return (
        <React.Fragment>
          { this.state.renderMagic ? <MagicImage
           magicEvent={this.props.magicEvent}
           x={this.props.x} 
           y={this.props.y} 
           scale={this.props.scale}
           shadowBlur={15} /> : null }
        </React.Fragment> 
      )
    }
  }

export const BenchReadyButton = (props) => {
  let [unready] = useImage(benchUnready)
  let [ready] = useImage(benchReady)
  let stage = props.stage;
  let image;
  let shadowColor;
    if (stage === 0) {
      image = unready;
      shadowColor = "#ff0000" 
    } else {
      image = ready;
      shadowColor = "#4feb34"
    }

  let scale = props.scale*15
  let width = scale*imageRatio(image);
  let height = scale;
  let x = props.x //- width/2;
  let y = props.y - height/2;
  
  
  return (
    <Image 
        image={image} 
        x={x} 
        y={y}
        width={width} 
        height={height}
        shadowBlur={props.shadowBlur} 
        shadowColor={shadowColor}
        onClick={props.onClick}
        onTap={props.onTap}
    />
  )
}

export const SevenChoiceInstruction = (props) => {
  let [higher] = useImage(higherArrow)
  let [lower] = useImage(lowerArrow)
  let choice = props.choice;
  let image;
    if (choice === 'higher') {
      image = higher;
    } else if (choice === 'lower') {
      image = lower;
    } else {
      return null;
    }

  let scale = props.scale*7
  let width = scale*imageRatio(image);
  let height = scale;
  let x = props.x //- width/2;
  let y = props.y - height/2;
  
  
  return (
    <Image 
        image={image} 
        x={x} 
        y={y}
        width={width} 
        height={height}
        shadowBlur={props.shadowBlur} 
        onClick={props.onClick}
        onTap={props.onTap}
    />
  )
}

