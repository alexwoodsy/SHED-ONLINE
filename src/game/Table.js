import React from 'react';
import {Layer, Group, Rect, Stage, Text, Line} from 'react-konva';
//import tablebackground from '../images/tabletop.jpg'
import Instructions from './player';
import { CardImage, CardRenderParam } from './card';
import { DEBUGING_UI } from '../config';



var padx = 15;
var pady = 15;
var cardScale = 10;
var cardwidth = 5*cardScale;
var cardheight = 7*cardScale;
var dropShadow = 20;


export class SHEDtable extends React.Component {
    state = {
        screenx: window.innerWidth,
        screeny: window.innerHeight,
        
    }

    updateDimensions = () => {
        this.setState({
            screenx: window.innerWidth,
            screeny: window.innerHeight,
            padx: 15,
            pady: 15,
            cardScale: 13,
            cardwidth: 5*this.state.cardScale,
            cardheight: 7*this.state.cardScale,
            dropShadow: 20,
            });
      };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        console.log(this.state.screenx, this.state.screeny)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }


    clickCard = (type, position, player) => {
        let thisPlayerNumber = parseInt(this.props.playerID); //the current player
        //player = card thats has been clicked

        if(type === 'draw') {//legacy not n more manual drawing
             this.props.moves.DrawCard()
        } else if(type === 'play' && player===thisPlayerNumber) {
            this.props.moves.PlayCard(position)
        } else if (type==='takeBench' && player===thisPlayerNumber) {
            this.props.moves.TakeBench(player, position)
        }else if (type==='addBench' && player===thisPlayerNumber) {
            this.props.moves.AddBench(player, position)
        }else if (type==='playBench' && player===thisPlayerNumber) {
            this.props.moves.PlayBench(position)
        };         
    };    

    clickReadyButton = (currentPlayer) => {

        this.props.moves.ReadyUp(currentPlayer)
    };

    clickendTurnButton = () => {
        this.props.moves.EndPlay()
    }

    clicksevenChoiceButton = (choice) => {
        this.props.moves.SevenChoice(choice)
    };

    clickTable = () => {
        this.props.moves.PickupTable()
    };
    
    getPlayerOrder = () =>{
        let thisPlayerNumber = parseInt(this.props.playerID);
        let numPlayers = this.props.ctx.numPlayers
        let playerOrder = [0, 1, 2, 3].slice(0, numPlayers);
        for (let i=0; i<thisPlayerNumber; i++) {
            let front = playerOrder.shift()
            playerOrder.push(front)
        };
        return playerOrder;
    }


    renderHand = (props) => {
        let thisPlayerNumber = parseInt(this.props.playerID); //the current player
        let x = this.state.screenx/2// cardwidth/2 
        let y =20 //screeny-pady-cardheight; 
        let cards = [];
        let zones =['bottom', 'top', 'left', 'right'];
        let playerOrder = this.getPlayerOrder()
        let numPlayers = this.props.ctx.numPlayers
        for (let i=0; i<numPlayers; i++) {
            let player = playerOrder[i]; //ensure current player is always at the bottom of screen
            let zone = zones[i];
            let hand = this.props.G.hands[player];
            let range = 300
            let cardParams = CardRenderParam(x, y, cardwidth, cardheight, this.state.screenx, this.state.screeny, padx, pady, range, hand.length, zone)
            for (let i= 0; i < hand.length; i++) {
                let xcord; let ycord;

                xcord = cardParams[i][0] 
                ycord = cardParams[i][1]
                
                //console.log('rendering:', hand[i], 'player', player, `at x:${xcord} y:${ycord} in zone ${zone}`)
                
                //define click type for bench setting stage and normal game play
                let phase = this.props.ctx.phase;
                let clickAction;
                if (phase === 'StartPhase') {clickAction = 'addBench'} else {clickAction = 'play'};
               
                cards.push(
                <CardImage
                    card={hand[i]}
                    key = {hand[i].name}
                    reverse={player!==thisPlayerNumber}
                    player={player}
                    width={cardwidth} 
                    height={cardheight}
                    x={xcord}
                    y={ycord}
                    rotation={cardParams[i][2]}
                    onClick={()=>this.clickCard(clickAction, i, player)}
                    shadowBlur={dropShadow}
                />)
            }
        }
        return cards
    };

    renderBench = (props) => {
        let x = this.state.screenx/2// cardwidth/2 
        let y = 120 //this.state.screeny-pady-cardheight;  
        let yspace = 20; 
        let range = 300
        let cards=[];

        let zones =['bottom', 'top', 'left', 'right'];
        let playerOrder = this.getPlayerOrder()
        let numPlayers = this.props.ctx.numPlayers
        for (let k=0; k<numPlayers; k++) {
            let player = playerOrder[k]; //ensure current player is always at the bottom of screen
            let zone = zones[k]
            let bench = this.props.G.benchs[player]
            
            //define click type for bench setting stage and normal game play
            let phase = this.props.ctx.phase;
            let clickAction;
            if (phase === 'StartPhase') {clickAction = 'takeBench'} else {clickAction = 'playBench'};
            
            for (let j=0; j<3; j++) {
                //find number of cards at postion. 
                let numAtPos = bench[j].length;
                for (let i=0; i<numAtPos; i++) {
                    let cardParams = CardRenderParam(x, y+i*yspace, cardwidth, cardheight, this.state.screenx, this.state.screeny, padx, pady, range, 3, zone) //hard coded as 3 on purpose
                    let xcord; let ycord;
                    //console.log('rendering:', bench[j], 'player', player, `at x:${xcord} y:${ycord} in zone ${zone}`)
                    xcord=cardParams[j][0]
                    ycord=cardParams[j][1]
                    let rotation = cardParams[j][2];

                    cards.push(
                        <CardImage
                            reverse={i===0}
                            card={ bench[j][i] }
                            key = { bench[j][i].name}
                            x={xcord} 
                            y={ycord} 
                            rotation={rotation}
                            width={cardwidth} 
                            height={cardheight}
                            player={player}
                            onClick={()=>this.clickCard(clickAction, j, player)}
                            shadowBlur={dropShadow}
                        />
                    )
                };
            };
        };
        return cards
    };

    renderDeck = (props) => {
        let deck = this.props.G.deck
        let x = props.x;
        let y = props.y;
        let topcard = deck[deck.length -1]
        if (deck.length > 0) {
            return (
                <CardImage 
                    key = {topcard.name}
                    card={topcard}
                    reverse={true} 
                    x={x} 
                    y={y} 
                    width={cardwidth} 
                    height={cardheight}
                    onClick={()=>this.clickCard('draw')}
                    shadowBlur={dropShadow}
                />
            );
        } else {
            return (<Text x={x} y={y+50} text={"deck\n(empty)"} fontSize={20} />);
        };
    };

    renderTable = (props) => {
        let table = this.props.G.table
        let x = props.x;
        let y = props.y;

        if (table.length > 0) {
            let tableCardsToRender = [];
            let index = table.length-1
            while (true) {
                let card = table[index]
                tableCardsToRender.push(card)
                if (card.invisible === false || index===0) {
                    break
                }
                index--
            }
            console.log('table cards', tableCardsToRender)
            //getTableCards(table, (table.length-1))
            let renderedCards = [];
            for (let i=0; i<tableCardsToRender.length; i++) {
                renderedCards.push( 
                    <CardImage 
                        card={tableCardsToRender[i]} 
                        key ={tableCardsToRender[i].name}
                        reverse={false} 
                        onClick={()=>this.clickTable()} 
                        width={cardwidth} 
                        height={cardheight}
                        x={x} 
                        y={y} 
                        shadowBlur={dropShadow}
                    />
                );
            }
            return renderedCards.reverse();
        } else {
           return <Text x={x} y={y+50} text={"table\n(empty)"} fontSize={20} />
        };
    };

    // renderPlayerUI = (props) => {
    //     let playerUIelements = null;
        
    //     if (this.props.ctx.currentPlayer===0) {
    //         playerUIelements = <React.Fragment> 
                
    //             </React.Fragment> 
    //     }
    //     return playerUIelements;
    // };



   

    readyButton = (props) => {
        let phase = this.props.ctx.phase;
        let state = this.props.G.Ready[props.player]
        let colour = 'white'

        let bench = this.props.G.benchs[this.props.ctx.currentPlayer]
        let benchTot=0;
        for (let j=0; j<3; j++) {
            benchTot = benchTot + bench[j].length;  
        }
        
        if (state===1) {
            colour = '#14ff76'
        }
        if (phase==='StartPhase' && benchTot === 6) {
            return (<Group>
                <Rect x={this.state.screenx/2 - 60} y={this.state.screeny/2-cardheight/2 + 150} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clickReadyButton(props.player)}
                    />
                    <Text x={this.state.screenx/2 - 60} y={this.state.screeny/2-cardheight/2 + 150} align={'center'} text={'Ready'} fontSize={25} fill={'black'} />
            </Group>)
        } else {
            return null;
        };;
        
    };


    endTurnButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let bench = this.props.G.benchs[this.props.ctx.currentPlayer]
        let benchTot=0;
        for (let j=0; j<3; j++) {
            benchTot = benchTot + bench[j].length;  
        }
        
        let numMoves = this.props.ctx.numMoves;
        let x = padx;
        let y =this.state.screeny - pady -cardheight;
        let colour = 'white';
        
        if ((stage==='play' || stage==='playBench') && numMoves >=1 && this.props.playerID === this.props.ctx.currentPlayer) { 
            return (<Group>
                <Rect x={x} y={y} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clickendTurnButton(props.player)}
                    />
                    <Text x={x} y={y+10} align={'center'} text={'End Turn'} fontSize={25} fill={'black'} />
            </Group>)
        } else {
            return null;
        }
    }

    sevenChoiceButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let x = padx;
        let y = this.state.screeny - pady - cardheight;
        let width = 100;
        let height = 50;
        let sep = 20;
        let fontsize = 25;
        let colour = 'white';
        
        if (stage==='sevenChoice' && this.props.playerID === this.props.ctx.currentPlayer) {
            return (<Group>
                    <Rect x={x+sep+width} y={y} width={width} height={height} fontSize={fontsize}
                    fill={colour} cornerRadius={20} onClick={()=>this.clicksevenChoiceButton('higher', props.player)}/>
                    <Text x={x+sep+width} y={y+10} align={'center'} text={'higher'} fontSize={25} fill={'black'} />

                    <Rect x={x} y={y} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clicksevenChoiceButton('lower', props.player)}/>
                    <Text x={x} y={y+10} align={'center'} text={'lower'} fontSize={25} fill={'black'} />
            </Group>)
        } else {
            return null;
        }
    }

    renderInstructions = (props) => {
        let player = parseInt(this.props.playerID)
        let text = Instructions(this.props.G, this.props.ctx, player);
        
        let width = 200;
        let height = 50;
        let x = this.state.screenx - padx -width - cardwidth*2;
        let y = this.state.screeny - pady - cardheight*2;
        let fontsize = 25;
        let colour = 'white';
        
        return(<Group >
            <Rect x={x} y={y} width={width} height={height}
                fill={colour} cornerRadius={10}
                />
                <Text x={x} y={y+10} align={'center'} text={text} fontSize={fontsize} fill={'black'} />
        </Group>)
    };

    renderGameInfo = () => {
        let matchData = this.props.matchData;
        let playerID = this.props.playerID;
        let matchID = this.props.matchID;

        if (DEBUGING_UI) {
            return <Text x={10} y={10} text={`player ${this.props.playerID}`} fontSize={15} />;
        }
        return (
            <Group>
                <Text x={10} y={10} text={"player: ".concat(matchData[playerID].name)} fontSize={15} />
                <Text x={10} y={30} text={"Game: ".concat(matchID)} fontSize={15}/>
                <Text x={10} y={50} text={"Connected: ".concat(matchData[playerID].isConnected)} fontSize={15}/>
            </Group>
        );

    };

    renderGrid = () => {
        if (DEBUGING_UI) {
            let yline = [(this.state.screenx/2), (0), (this.state.screenx/2), (this.state.screeny)]
            let xline = [(0), (this.state.screeny/2), (this.state.screenx), (this.state.screeny/2)]
            return(
                <Layer>
                    <Rect x={padx} y={pady} width={this.state.screenx-2*padx} height={this.state.screeny-2*pady} fill="blue" />
                    <Line points={yline} stroke="red" strokeWidth={3}/>
                    <Line points={xline} stroke="red" strokeWidth={3}/>
                </Layer>
            )
        } 
        return null;
    }
    
    render() {
        
        //loop over all 4 players and render them accordingly
        let thisPlayerNumber = parseInt(this.props.playerID);
        let Gameover = this.props.ctx.gameover;
        if (Gameover !== undefined) {
             return (
                <div>
                 <h1> player {Gameover.winner}  won! </h1>
             </div>
             );

         } else {
            return (
                <Stage width={this.state.screenx} height={this.state.screeny}>
                    <this.renderGrid />
                    <Layer>
                        <this.renderGameInfo />
                        <this.renderDeck x={this.state.screenx/2 - 60} y={this.state.screeny/2-cardheight/2}  /> 
                        <this.renderTable x={this.state.screenx/2 + 60} y={this.state.screeny/2-cardheight/2} />
                        <this.readyButton player={ thisPlayerNumber } />
                        <this.endTurnButton />
                        <this.sevenChoiceButton />
                        <this.renderInstructions/>
                    </Layer>
                    <Layer>
                        <this.renderHand />
                        <this.renderBench />
                    </Layer>
                </Stage>
            );
         };
    };
}

export default SHEDtable



/* 
table style div
<div style = {{
    backgroundImage: `url(${tablebackground})`,
    width: {this.state.screenx},
    height: {this.state.screeny}
}}></div>

 */