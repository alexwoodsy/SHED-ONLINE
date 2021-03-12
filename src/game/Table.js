import React from 'react';
import {Layer, Group, Rect, Stage, Text, Line } from 'react-konva';
import { CardImage, CardRenderParam } from './card';
import { MagicEvent, BenchReadyButton, SevenChoiceInstruction, GameOver, Instructions } from './gameUI'
import { DEBUGING_UI } from '../config';
import "./Style.css"

const cardScale = () => {
    let factor = 50;
    return (window.innerWidth > window.innerHeight) ?  window.innerHeight/factor : window.innerWidth/factor
}



export class SHEDtable extends React.Component {
    
    state = {
        screenx: window.innerWidth,
        screeny: window.innerHeight,
        padx: 15,
        pady: 15,
        cardScale: cardScale(),
        cardwidth: 5*cardScale(),
        cardheight: 7*cardScale(),
        dropShadow: 20,
        hostClient: null,
    }

    updateDimensions = () => {
        let scale = cardScale()
        this.setState({
            screenx: window.innerWidth,
            screeny: window.innerHeight,
            padx: 15,
            pady: 15,
            cardScale: scale,
            cardwidth: 5*scale,
            cardheight: 7*scale,
            dropShadow: 20,
            });
      };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        document.addEventListener("newMatchCreated", this.handleNewMatch, { once: true })
        
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
        document.removeEventListener("newMatchCreated", this.handleNewMatch )
    }

    componentDidUpdate(prevProps) {
        

        //when all players have made a choice dispatch num of players for new match
        if (this.props.ctx.phase === "EndPhase" && (this.props.G.hostClient !== prevProps.G.hostClient) ) {
            console.log('host', this.props.G.hostClient, 'this player', this.props.playerID, this.props.G.hostClient===this.props.playerID)
            if (this.props.G.hostClient===this.props.playerID) {
                document.dispatchEvent(new CustomEvent("PlayAgain", {
                    detail: {players: this.props.G.playingAgain}
                }))
            }
        }

    if (this.props.ctx.phase === "EndPhase" && this.props.G.newMatchID !== prevProps.G.newMatchID ) {
        console.log("match id new ",this.props.G.newMatchID)
            if (this.props.G.newMatchID === "INSUFF_PLAYERS") {
                document.dispatchEvent(new CustomEvent("ReturnLobby"))    
            } else if (this.props.G.newMatchID !== null) {
                document.dispatchEvent(new CustomEvent("JoinNewMatch", {
                    detail: { matchID: this.props.G.newMatchID }
                }))
            }
        }
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

    handlePlayAgain = (choice) => {
        this.props.moves.playAgain(choice, parseInt(this.props.playerID))
        //leave if the player chose to return to lobby (done here so G updates)
        if (this.props.G.playingAgain[parseInt(this.props.playerID)]===false) {
           document.dispatchEvent(new CustomEvent("ReturnLobby"))
        }
        
    }

    handleNewMatch = () => {
        if (this.props.G.newMatchID===null) {
            console.log('setting new match ID')
            this.props.moves.setnewMatchID(localStorage.getItem("newMatchID"))
        }  
    }
  

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
            let range = 3*this.state.screenx/4
            let cardParams = CardRenderParam(x, y, this.state.cardwidth, this.state.cardheight, this.state.screenx, this.state.screeny, this.state.padx, this.state.pady, range, hand.length, zone)
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
                    key = {player.toString().concat(hand[i].name)}
                    reverse={player!==thisPlayerNumber}
                    player={player}
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    x={xcord}
                    y={ycord}
                    rotation={cardParams[i][2]}
                    onClick={()=>this.clickCard(clickAction, i, player)}
                    onTap={()=>this.clickCard(clickAction, i, player)}
                    shadowBlur={this.state.dropShadow}
                />)
            }
        }
        return cards
    };

    renderBench = (props) => {
        let x = this.state.screenx/2// cardwidth/2 
        let yspace = this.state.cardheight/10; 
        let y = 3*this.state.pady + this.state.cardheight;  
        
        let range = 500
        let cards=[];

        let zones =['bottom', 'top', 'left', 'right'];
        let playerOrder = this.getPlayerOrder()
        let numPlayers = this.props.ctx.numPlayers
        for (let k=0; k<numPlayers; k++) {
            let player = playerOrder[k]; //ensure current player is always at the bottom of screen
            let zone = zones[k]
            let bench = this.props.G.benchs[player]
            //console.log('bench', bench)
            //define click type for bench setting stage and normal game play
            let phase = this.props.ctx.phase;
            let clickAction;
            if (phase === 'StartPhase') {clickAction = 'takeBench'} else {clickAction = 'playBench'};
            
            for (let j=0; j<3; j++) {
                //find number of cards at postion. 
                let numAtPos = bench[j].length;
                for (let i=0; i<numAtPos; i++) {
                    let cardParams = CardRenderParam(x, y-i*yspace, this.state.cardwidth, this.state.cardheight, this.state.screenx, this.state.screeny, this.state.padx, this.state.pady, range, 3, zone) //hard coded as 3 on purpose
                    let xcord; let ycord;
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
                            width={this.state.cardwidth} 
                            height={this.state.cardheight}
                            player={player}
                            onClick={()=>this.clickCard(clickAction, j, player)}
                            onTap={()=>this.clickCard(clickAction, j, player)}
                            shadowBlur={this.state.dropShadow}
                        />
                    )
                };
            };
        };
        return cards
    };

    renderDeck = (props) => {
        let deck = this.props.G.deck
        let x = this.state.screenx/2 - 3*this.state.cardwidth/2;
        let y = this.state.screeny/2-this.state.cardheight/2;
        let topcard = deck[deck.length -1]
        if (deck.length > 0) {
            return (
                <CardImage 
                    key = {topcard.name}
                    card={topcard}
                    reverse={true} 
                    x={x} 
                    y={y} 
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    onClick={()=>this.clickCard('draw')}
                    onTap={()=>this.clickCard('draw')}
                    shadowBlur={this.state.dropShadow}
                />
            );
        } else {
            return (
                <CardImage 
                    card={null} 
                    key ={"emptyTable"}
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    x={x} 
                    y={y} 
                />
               )
        };
    };

    renderTable = (props) => {
        let table = this.props.G.table
        let x = this.state.screenx/2 + this.state.cardwidth/2;
        let y = this.state.screeny/2-this.state.cardheight/2;
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
            //console.log('table cards', tableCardsToRender)
            //getTableCards(table, (table.length-1))
            let renderedCards = [];
            for (let i=0; i<tableCardsToRender.length; i++) {
                renderedCards.push( 
                    <CardImage 
                        card={tableCardsToRender[i]} 
                        key ={tableCardsToRender[i].name}
                        reverse={false} 
                        onClick={()=>this.clickTable()} 
                        onTap={()=>this.clickTable()}
                        width={this.state.cardwidth} 
                        height={this.state.cardheight}
                        x={x} 
                        y={y} 
                        shadowBlur={this.state.dropShadow}
                    />
                );
            }
            return renderedCards.reverse();
        } else {
           return (
            <CardImage 
                card={null} 
                key ={"emptyTable"}
                width={this.state.cardwidth} 
                height={this.state.cardheight}
                x={x} 
                y={y} 
            />
           )
        };
    };

 

    readyButton = (props) => {
        let phase = this.props.ctx.phase;
        let stage = this.props.G.Ready[props.player]
        let width = 9*this.state.cardScale;
        let x = this.state.screenx/2 -width - 2* this.state.cardwidth - this.state.padx;
        let y = this.state.screeny - this.state.pady - 2*this.state.cardheight;

        let bench = this.props.G.benchs[this.props.playerID]
        let benchTot=0;
        for (let j=0; j<3; j++) {
            benchTot = benchTot + bench[j].length;  
        }
        
        if (phase==='StartPhase' && benchTot === 6) {
            return (
                <BenchReadyButton 
                    x={x} 
                    y={y} 
                    stage={stage}
                    scale={this.state.cardScale} 
                    shadowBlur={this.state.dropShadow}
                    onClick={()=>this.clickReadyButton(props.player)}
                    onTap={()=>this.clickReadyButton(props.player)}
                />
            )
        } else {
            return null;
        };;
        
    };

    endTurnButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let hasTen = this.props.G.hasTen;
        let numMoves = this.props.ctx.numMoves;
        let width = 9*this.state.cardScale;
        let height = 3*this.state.cardScale;
        let fontsize = 2*this.state.cardScale
        let x = this.state.screenx/2 -width - 2* this.state.cardwidth - this.state.padx;
        let y = this.state.screeny - this.state.pady - 2*this.state.cardheight;
        let colour = 'white';
    
        if ((stage==='play' || stage==='playBench') &&
            numMoves >=1 && 
            this.props.playerID === this.props.ctx.currentPlayer 
            && (this.props.G.magicEvent.type!=='burning' || hasTen)
            ) { 
            return (<Group onClick={()=>this.clickendTurnButton(props.player)} onTap={()=>this.clickendTurnButton(props.player)}>
                <Rect x={x} y={y} width={width} height={height} fontSize={fontsize}
                    fill={colour} cornerRadius={20} 
                    />
                    <Text x={x} y={y+height/4} align={'center'} text={'End Turn'} fontSize={fontsize} fill={'black'} />
            </Group>)
        } else {
            return null;
        }
    }

    sevenChoiceButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let sep = 6*this.state.cardScale;
        let x = this.state.screenx/2 - 2*sep - 2* this.state.cardwidth - this.state.padx;
        let y = this.state.screeny - this.state.pady - 2*this.state.cardheight;
        
        if (stage==='sevenChoice' && this.props.playerID === this.props.ctx.currentPlayer) {
            return (
            <Group>
                <SevenChoiceInstruction 
                    x={x+sep} 
                    y={y} 
                    scale={this.state.cardScale} 
                    choice={'higher'}
                    onClick={()=>this.clicksevenChoiceButton('higher', props.player)}
                    onTap={()=>this.clicksevenChoiceButton('higher', props.player)}
                />
                <SevenChoiceInstruction 
                    x={x} 
                    y={y} 
                    scale={this.state.cardScale} 
                    choice={'lower'}
                    onClick={()=>this.clicksevenChoiceButton('lower', props.player)}
                    onTap={()=>this.clicksevenChoiceButton('lower', props.player)}
                />
            </Group>)
        } else {
            return null;
        }
    }

    
    renderInstructions = (props) => {
        let player = parseInt(this.props.playerID)
        let text = Instructions(this.props.G, this.props.ctx, player);
        
        let width = 16*this.state.cardScale;
        let height = 3*this.state.cardScale;
        let x = this.state.screenx/2 + this.state.padx + 3*this.state.cardwidth/2;
        let y = this.state.screeny - this.state.pady - this.state.cardheight*2;
        let fontsize = 2*this.state.cardScale;
        let colour = 'white';
        
        return(<Group >
            <Rect x={x} y={y} width={width} height={height}
                fill={colour} cornerRadius={10}
                />
                <Text x={x} y={y+height/4} align={'center'} text={text} fontSize={fontsize} fill={'black'} />
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
                    {/* <Rect x={this.state.padx} y={this.state.pady} width={this.state.screenx-2*this.state.padx} height={this.state.screeny-2*this.state.pady} fill="blue" /> */}
                    <Line points={yline} stroke="red" strokeWidth={3}/>
                    <Line points={xline} stroke="red" strokeWidth={3}/>
                </Layer>
            )
        } 
        return null;
    }

    EndOfGameOptions = () => {
        let pressed = false;
        for (let i=0; i<this.props.ctx.numPlayers; i++) {
            if (this.props.G.playingAgain[i]!==null && i === parseInt(this.props.playerID)) {
                pressed = true

            }
        } 

        if (pressed===false) {
            return (
                <div id="overlay">
                    <button id="EndGameChoice" onClick={()=>this.handlePlayAgain(true)}>
                        play again
                    </button>
                    <button id="EndGameChoice" onClick={()=>this.handlePlayAgain(false)}>
                        return to lobby
                    </button>
                </div>
            ) 
        } else {
            return null;
        }
       
    }
    
    render() {
       
               
        //loop over all 4 players and render them accordingly
        let thisPlayerNumber = parseInt(this.props.playerID);
        if (this.props.ctx.phase === "EndPhase"  && DEBUGING_UI) {
            return (
                <div>
                 <h1> player {this.props.G.winner}  won! </h1>
             </div>
            )
        }
        
        if (this.props.ctx.phase === "EndPhase") {
            return (
                <div>
                    <this.EndOfGameOptions />
                    <Stage width={this.state.screenx} height={this.state.screeny}>
                        <this.renderGrid />
                        <Layer>
                            <this.renderGameInfo />
                            <this.renderDeck /> 
                            <this.renderTable />
                        </Layer>
                        <Layer>
                            <this.renderHand />
                            <this.renderBench />
                            <GameOver
                                winnerID={this.props.G.winner}
                                matchData={this.props.matchData}
                                playerID={thisPlayerNumber}
                                tableState={this.state}
                            />
                        </Layer>
                    </Stage>
                </div>
                
            );

         } else {
            return (
                <Stage width={this.state.screenx} height={this.state.screeny}>
                    <this.renderGrid />
                    <Layer>
                        <this.renderGameInfo />
                        <this.renderDeck /> 
                        <this.renderTable />
                        <this.readyButton player={ thisPlayerNumber } />
                        <this.endTurnButton />
                        <this.sevenChoiceButton />
                        <this.renderInstructions/>
                    </Layer>
                    <Layer>
                        <this.renderHand />
                        <this.renderBench />
                    </Layer>
                    <Layer>
                    <SevenChoiceInstruction 
                        x={this.state.screenx/2 + this.state.padx + 3*this.state.cardwidth/2} 
                        y={this.state.screeny/2} 
                        scale={this.state.cardScale} 
                        choice={(this.props.G.sevenHighLow === 'default') ? "" : this.props.G.sevenHighLow}
                    />
                    </Layer>
                    <Layer>
                        <MagicEvent 
                        magicEvent={this.props.G.magicEvent} 
                        x={this.state.screenx/2} 
                        y={this.state.screeny/2}
                        scale={this.state.cardScale}
                        />
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