import React, { useRef, useEffect, useState } from "react";
import { Image, Group } from "react-konva";
import useImage from "use-image";
//magic
import burn from "../images/magicEvents/burn.png";
import invisible from "../images/magicEvents/Invis.png";
import HighOrLow from "../images/magicEvents/HighOrLow.png";
import reset from "../images/magicEvents/reset.png";
//ui
import wood from "../images/UI/wood.png";
import waitingImg from "../images/UI/Waiting.png";
import waitingHandsImg from "../images/UI/WaitingHands.png";
import yourTurnImg from "../images/UI/YourTurn.png";
//end turn button
import endTurn from "../images/UI/EndTurn.png";
//benchui
import benchReady from "../images/UI/BenchReady.png";
import benchUnready from "../images/UI/BenchUnready.png";
//sevenchoices
import higherArrow from "../images/magicEvents/HigherArrow.png";
import lowerArrow from "../images/magicEvents/LowerArrow.png";
//gameover
import winnerScreen from "../images/Winner.png";
import loserScreen from "../images/Loser.png";

const MagicImages = {
  burn: burn,
  invisble: invisible,
  highOrLow: HighOrLow,
  reset: reset,
  wood: wood,
};

export function imageRatio(image) {
  //scale image
  let imgRatio = 1;
  if (image !== undefined) {
    imgRatio = image.width / image.height;
  }
  return imgRatio;
}

const MagicImage = (props) => {
  let magicEvent = props.magicEvent;
  let img;
  switch (magicEvent.type) {
    case "burning":
      img = MagicImages.burn;
      break;
    case "Invisible":
      img = MagicImages.invisble;
      break;
    case "reset":
      img = MagicImages.reset;
      break;
    case "Higher or lower":
      img = MagicImages.highOrLow;
      break;
    default:
      img = MagicImages.wood;
      break;
  }

  const [image] = useImage(img);
  let scale = props.scale * 30;
  let width = scale * imageRatio(image);
  let height = scale;
  let x = props.x - width / 2;
  let y = props.y - height / 2;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      shadowBlur={props.shadowBlur}
    />
  );
};

export class MagicEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderMagic: true,
    };

    this.interval = null;
  }

  getMagicEvent = () => {
    let magicEvent = this.props.magicEvent;
    let magicCheck = magicEvent.type !== null;

    this.setState({
      renderMagic: magicCheck,
    });

    this.interval = setTimeout(
      () => this.setState({ renderMagic: false }),
      1500
    );
  };

  componentDidMount() {
    this.getMagicEvent();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidUpdate(prevProps) {
    if (this.props.magicEvent.type !== prevProps.magicEvent.type) {
      this.setState({ renderMagic: true });
      this.getMagicEvent();
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.renderMagic ? (
          <MagicImage
            magicEvent={this.props.magicEvent}
            x={this.props.x}
            y={this.props.y}
            scale={this.props.scale}
            shadowBlur={15}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

export const EndTurnButton = (props) => {
  let [UnPressed] = useImage(endTurn);
  let scale = props.scale * 8;
  let width = scale * imageRatio(UnPressed);
  let height = scale;
  let x = props.x - width / 2;
  let y = props.y - height / 2;

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
  );
};

export const BenchReadyButton = (props) => {
  let [unready] = useImage(benchUnready);
  let [ready] = useImage(benchReady);
  let stage = props.stage;
  let image;
  let shadowColor;
  if (stage === 0) {
    image = unready;
    shadowColor = "#ff0000";
  } else {
    image = ready;
    shadowColor = "#4feb34";
  }

  let scale = props.scale * 8;
  let width = scale * imageRatio(image);
  let height = scale;
  let x = props.x;
  let y = props.y - height / 2;

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
  );
};

export const SevenChoiceInstruction = (props) => {
  let [higher] = useImage(higherArrow);
  let [lower] = useImage(lowerArrow);
  let choice = props.choice;
  let image;
  if (choice === "higher") {
    image = higher;
  } else if (choice === "lower") {
    image = lower;
  } else {
    return null;
  }

  let scale = props.scale * 5;
  let width = scale * imageRatio(image);
  let height = scale;
  let x = props.x - width;
  let y = props.y - height / 2;

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
  );
};

export const GameOver = (props) => {
  let namesOrdered = []
  
  for (let i=0; i < props.winningOrder.length; i++) {
    namesOrdered.push(props.playerNames[parseInt(props.winningOrder[i])])
  };


  const Rankings = () => (
    <div id="EndScreenRankings" >loosing order:
        <div>
          {namesOrdered.slice(1, namesOrdered.length).map((name, index)=>{
            return <div key={index}>{index+2}. {name}</div> 
          })}
        </div>
      </div>
  )

  if (Number(props.playerID) === Number(props.winningOrder[0])) {
    return (
      <div>
        <div id="EndScreenMessage">
          <img
            className="EndScreenImage"
            src={winnerScreen}
            alt={wood}
          />
          Well done {namesOrdered[0]}, you won!
          {namesOrdered.length>1 && (<Rankings />)}
        </div>
      </div>
      
    );
  } else {
    return (
      <div id="EndScreenMessage">
        <img
          className="EndScreenImage"
          src={loserScreen}
          alt={wood}
        />
        Unlucky, you lost! {namesOrdered[0]} Won!
        {namesOrdered.length>1 && (<Rankings />)}
      </div>
    );
  }
};

export class FinishedMessage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      show: false,
    };
    this.interval = null;
  }

  componentDidUpdate (prevProps) {
    if (prevProps.winningOrder!==this.props.winningOrder && this.props.winningOrder.length !==0) {
      this.setState({
        show: true
      })

      this.interval = setTimeout(
        () => this.setState({
          show: false
        }), 5000
      );
    }
  }

    
  render() {
    let winningOrder = this.props.winningOrder
    let place = winningOrder.length.toString()
    let finishedPosition = place === "1" ? "1st" : place ==="2" ? "2nd": place==="3" ? "3rd": place==="4"? "4th": "" 
    let finishedPlayerID = winningOrder[winningOrder.length-1]
    let finishedName = this.props.playerNames[finishedPlayerID]
    
    let finishedMessage = `Well done ${finishedName}! you came ${finishedPosition}! Waiting for others to finish...`
    let otherMessage = `${finishedName} has finished ${finishedPosition}! keep on going...`

    if (this.state.show) {
      return (
        <div id="finishedMessage" style={this.props.player === finishedPlayerID?{backgroundColor:"rgba(9, 255, 0, 0.6)"}:{}}>
          {this.props.player === finishedPlayerID? finishedMessage : otherMessage}
        </div>
        )
    } else {
      return null;
    }
  }
  
}


export const Instructions = (props) => {
  let [waiting] = useImage(waitingImg);
  let [waitingHands] = useImage(waitingHandsImg)
  let [yourTurn] = useImage(yourTurnImg);
  let currentPlayer = props.currentPlayer;
  let phase = props.phase;
  let player = props.player;
  let numPlayers = props.numPlayers
  let x = props.x;
  let y = props.y;
  let scale = props.scale * 10;
  const handsRef = useRef(null)
  
  useEffect(()=>{
   // sethandPosition(Number(currentPlayer))
  }, [currentPlayer])

  useEffect(()=>{
    const rotateHand = () => {
      handsRef.current.to({
        rotation: (Number(currentPlayer)+1)*90,
        duration: (Number(currentPlayer)+1)
      })

    }

    if (handsRef.current !== null) {
      rotateHand()
    }

  }, [handsRef, currentPlayer, numPlayers])

  

  if (phase === "StartPhase") {
    return null;
  } else if (phase === "MainPhase") {
    if (player.toString() === currentPlayer) {
      // instructions for player making turn
      let width = scale * imageRatio(yourTurn);
      let height = scale;
      y = y - height / 2;
      return (
        <Image
          image={yourTurn}
          x={x}
          y={y}
          width={width}
          height={height}
          shadowBlur={props.shadowBlur}
        />
      );
    } else {
      //instructions for everyone else
      let width = scale * imageRatio(waiting);
      let height = scale;
      y = y - height / 2;

      let widthHands  = scale/4 * imageRatio(waitingHands)
      let heightHands = scale/4
      let xoffset = 2*widthHands/5
      let yoffset = 9*heightHands/10
      let xHands= x + width/2 -xoffset
      let yHands = y  + height/2 +yoffset/2

      return (
        <Group>
          <Image
            image={waiting}
            x={x}
            y={y}
            width={width}
            height={height}
            shadowBlur={props.shadowBlur}
          />
          <Image
            ref={handsRef}
            image={waitingHands}
            x={xHands}
            y={yHands}
            width={widthHands}
            height={heightHands}
            rotation={0}
            offset={{
              x: xoffset,
              y: yoffset
            }}
            shadowBlur={props.shadowBlur}
          />
      </Group>
        
      );
    }
  } else {
    return null;
  }
};
