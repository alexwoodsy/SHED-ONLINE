import React from "react"; //, { useEffect, useState }
import { Image } from 'react-konva';
import useImage from 'use-image';
import burn from '../images/magicEvents/burn.png'
import invisible from '../images/magicEvents/Invis.png'
import HighOrLow from '../images/magicEvents/HighOrLow.png'
import reset from '../images/magicEvents/reset.png'
import wood from '../images/UI/wood.png'

const MagicImages = {
  burn: burn,
  invisble: invisible,
  highOrLow: HighOrLow,
  reset: reset,
  wood: wood,
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
  //scale image
  let imageRatio=1; //inni to 1 ao image still renders
  if (image !== undefined) {
    imageRatio = image.width/image.height
  }

  let scale = props.scale*30
  let width = scale*imageRatio;
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



//BenchImage - need this for doing these

//SevenChoiceImage


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
            
        this.interval = setTimeout(() => this.setState({renderMagic: false}), 2000);
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



