import React, {useRef, useEffect} from "react"; 
import { Image } from 'react-konva';
import useImage from 'use-image';
//magic
import burn from '../images/magicEvents/burn.png'
import invisible from '../images/magicEvents/Invis.png'
import HighOrLow from '../images/magicEvents/HighOrLow.png'
import reset from '../images/magicEvents/reset.png'
//ui
import wood from '../images/UI/wood.png'
import waitingImg from '../images/UI/Waiting.png'
import yourTurnImg from '../images/UI/YourTurn.png'
//end turn button
import endTurn from '../images/UI/EndTurn.png'
//import endTurnDepressed from '../images/UI/EndTurnDepressed.png'
//benchui
import benchReady from '../images/UI/BenchReady.png'
import benchUnready from '../images/UI/BenchUnready.png'
//sevenchoices
import higherArrow from '../images/magicEvents/HigherArrow.png'
import lowerArrow from '../images/magicEvents/LowerArrow.png'
//gameover
import winnerScreen from '../images/Winner.png'
import loserScreen from '../images/Loser.png'

const MagicImages = {
  burn: burn,
  invisble: invisible,
  highOrLow: HighOrLow,
  reset: reset,
  wood: wood,
}

export function imageRatio (image) {
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

  export const EndTurnButton = (props) => {
    let [UnPressed] = useImage(endTurn)
    let scale = props.scale*8
    let width = scale*imageRatio(UnPressed);
    let height = scale;
    let x = props.x - width/2;
    let y = props.y - height/2;
   
    
    return (
      <Image 
        image={UnPressed} 
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

  let scale = props.scale*8
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

  let scale = props.scale*5
  let width = scale*imageRatio(image);
  let height = scale;
  let x = props.x - width;
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

export const GameOver = (props) => {
  let winnerID = props.winnerID
  let matchData=props.matchData;
  let playerID = props.playerID;
  let winner=null;
  let losers=[];
  
  for (let i=0; i<matchData.length; i++) {
    if (i !== parseInt(winnerID) ) {
      losers.push (matchData[i])
    } else {
      winner=matchData[i];
    }
  }

  let loserNames=[]
    losers.forEach(element => {
      loserNames.push ( element.name )
    });

    if (playerID===winner.id) {
      return (
        <div id="EndScreenMessage">
          <img id="EndScreenImage" src={winnerScreen} alt={wood} />
          Well done {winner.name}, you won!
        </div>
        
      )
    } else {
      return(
        <div id="EndScreenMessage" >
          <img id="EndScreenImage" src={loserScreen} alt={wood} />
          Unlucky, you lost! {winner.name} Won!
      
      </div>
      )
    }

}


export const Instructions = (props) => {
  let [waiting] = useImage(waitingImg);
  let [yourTurn] = useImage(yourTurnImg)
  let currentPlayer = props.currentPlayer
  let phase = props.phase;
  let player = props.player
  let x = props.x
  let y = props.y
  let scale = props.scale*10

  const waitingRef = useRef(null)
  //const shoWhosTurn = useRef(false) //use this to show the player whos turn

  useEffect(()=>{
    let counter;
    const onHover = () => {
      counter = setTimeout(()=>{
        console.log(player)
      },500)
    }

    const stopCounter = () => {
      clearTimeout(counter)
    }

    if (waitingRef.current!==null ) {
      waitingRef.current.on('mouseover',()=>onHover()) 
      waitingRef.current.on('mouseout',()=>stopCounter() )
    }

    return () => {
      stopCounter()
    }

  }, [waitingRef, player])

  
  if (phase==='StartPhase') {
    return null
  } else if (phase==='MainPhase') {
      if (player.toString()===currentPlayer) { // instructions for player making turn
        let width = scale*imageRatio(yourTurn);
        let height = scale;
        y = y - height/2
        return (
          <Image 
              image={yourTurn} 
              x={x} 
              y={y}
              width={width} 
              height={height}
              shadowBlur={props.shadowBlur} 
          />
        )
      } else { //instructions for everyone else
        let width = scale*imageRatio(waiting);
        let height = scale;
        y = y - height/2
        return (
          <Image
              ref={waitingRef}
              image={waiting} 
              x={x} 
              y={y}
              width={width} 
              height={height}
              shadowBlur={props.shadowBlur} 
          />
        )
      }  
  } else {
    return null;
  }
}