import React from 'react';
import {Layer, Group, Stage, Text, Line } from 'react-konva';
import Menu from './Menu'
import { Pending } from '../pages/gameroom'
import { CardImage, CardRenderParam } from './card';
import { MagicEvent, BenchReadyButton, SevenChoiceInstruction, Instructions, EndTurnButton, GameOver, FinishedMessage, CutInEvent } from './gameUI'
import { DEBUGING_UI } from '../config';
import "../pages/Style.css"

const cardScale = () => {
    let factor = 40;
    return (window.innerWidth > window.innerHeight) ?  window.innerHeight/factor : window.innerWidth/factor
}

export class SHEDtable extends React.Component {
    state = {
        screenx: window.innerWidth,
        screeny: window.innerHeight- window.innerHeight*0.06,
        padx: 0,
        pady: window.innerHeight*0.06,
        cardScale: cardScale(),
        cardwidth: 5*cardScale(),
        cardheight: 7*cardScale(),
        uiHeight:3*window.innerHeight/4,
        dropShadow: 20,
        hostClient: null,
        playerNames: !DEBUGING_UI ? this.props.matchData.map(elem=>elem.name) : [],
        showWaitingForOthers: true,
    }

    

    updateDimensions = () => {
        let scale = cardScale()
        this.setState({
            screenx: window.innerWidth,
            screeny: window.innerHeight- window.innerHeight*0.06,
            padx: 0,
            pady: 0,
            cardScale: scale,
            cardwidth: 5*scale,
            cardheight: 7*scale,
            uiHeight:3*window.innerHeight/4,
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
            if (this.props.G.hostClient===this.props.playerID) {
                document.dispatchEvent(new CustomEvent("PlayAgain", {
                    detail: {players: this.props.G.playingAgain}
                }))
            }
        }

        if (this.props.ctx.phase === "EndPhase" && this.props.G.newMatchID !== prevProps.G.newMatchID ) {
            this.setState({showWaitingForOthers: false})
            if (this.props.G.newMatchID === "INSUFF_PLAYERS") {
                document.dispatchEvent(new CustomEvent("ReturnLobby"))    
            } else if (this.props.G.newMatchID !== null) {
                document.dispatchEvent(new CustomEvent("JoinNewMatch", {
                    detail: { matchID: this.props.G.newMatchID }
                }))
            }
        }

        if (this.props.ctx.phase === "EndPhase" && this.props.G.playingAgain[parseInt(this.props.playerID)]===false) {
            document.dispatchEvent(new CustomEvent("ReturnLobby"))
        }
    }

    
    clickCard = (type, position, player) => {
        let thisPlayerNumber = parseInt(this.props.playerID); 
        if(type === 'draw') {
             this.props.moves.DrawCard(player)
        }else if(type === 'cutIn') {
            this.props.moves.CutIn(player, position)
        } else if(type === 'play' && player===thisPlayerNumber) {
            this.props.moves.PlayCard(position)
        } else if (type==='takeBench' && player===thisPlayerNumber) {
            this.props.moves.TakeBench(player, position)
        }else if (type==='addBench' && player===thisPlayerNumber) {
            this.props.moves.AddBench(player, position)
        }else if (type==='playBench' && player===thisPlayerNumber) {
            this.props.moves.PlayBench(position)
        } else if (type==='pickupBench' && player===thisPlayerNumber) {
            this.props.moves.TakeBench(player, position)
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
    }

    handleNewMatch = () => {
        if (this.props.G.newMatchID===null) {
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
        let thisPlayerNumber = parseInt(this.props.playerID);
        
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let x = this.state.screenx/2
        let y =0
        let cards = [];
        let zones =['bottom', 'top', 'left', 'right'];
        if (this.props.ctx.numPlayers > 2 ) {
            zones =['bottom', 'left', 'top', 'right'];
        }
    
        let playerOrder = this.getPlayerOrder()
        let numPlayers = this.props.ctx.numPlayers
        for (let i=0; i<numPlayers; i++) {
            let player = playerOrder[i]; //ensure current player is always at the bottom of screen
            let highlight=null;
            if (stage==="play") {
                if (player===thisPlayerNumber && player===parseInt(this.props.ctx.currentPlayer) ) {
                    highlight = "green"
                } else if (player===parseInt(this.props.ctx.currentPlayer)) {
                    highlight = "white"
                }
            } 
             
            let zone = zones[i];
            let hand = this.props.G.hands[player];
            let range = this.state.screenx/3
            if (player===thisPlayerNumber) {
                range = 3*this.state.screenx/4
            } else if (this.props.isMobile && player!==thisPlayerNumber) {
                range = this.state.screenx/2
            }
            
            let cardParams = CardRenderParam(x, y, this.state.cardwidth, this.state.cardheight, this.state.screenx, this.state.screeny, this.state.padx, this.state.pady, range, hand.length, zone, this.props.isMobile)
            for (let i= 0; i < hand.length; i++) {
                let xcord; let ycord;
                xcord = cardParams[i][0] 
                ycord = cardParams[i][1]
                
                //define click type for bench setting stage and normal game play
                let phase = this.props.ctx.phase;
                let clickAction;
                if (phase === 'StartPhase') {
                    clickAction = 'addBench'
                } else {
                    if (this.props.ctx.currentPlayer !== this.props.playerID) {
                        clickAction = 'cutIn'
                    } else {
                        clickAction = 'play'
                    }
                };
                let key = hand[i] !== null ? hand[i].name : `${player}hand${i}`
                if(hand[i] === null) { 
                } else {
                    cards.push(
                        <CardImage
                            card={hand[i]}
                            key = {key}
                            keyProp={key}
                            reverse={player!==thisPlayerNumber}
                            player={player}
                            expandable={player===parseInt(this.props.playerID)}
                            width={this.state.cardwidth} 
                            height={this.state.cardheight}
                            pady = {this.state.pady}
                            x={xcord}
                            y={ycord}
                            rotation={cardParams[i][2]}
                            onClick={()=>this.clickCard(clickAction, i, player)}
                            onTap={()=>this.clickCard(clickAction, i, player)}
                            shadowBlur={this.state.dropShadow}
                            highlight={highlight}
                            isPlayer={player===thisPlayerNumber}
                            isMobile={this.props.isMobile}
                        />
                    )
                }
                
            }
        }
        return cards
    };

    renderBench = () => {
        let thisPlayerNumber = parseInt(this.props.playerID);
        let x = this.state.screenx/2
        let yspace = this.state.cardheight/10; 
        let y = this.state.screeny/2 - 6*this.state.cardheight/5  
        let range = 500
        let cards=[];
        let zones =['bottom', 'top', 'left', 'right'];
        if (this.props.ctx.numPlayers > 2 ) {
            zones =['bottom', 'left', 'top', 'right'];
        }

        let playerOrder = this.getPlayerOrder()
        let numPlayers = this.props.ctx.numPlayers
        for (let k=0; k<numPlayers; k++) {
            let player = playerOrder[k]; //ensure current player is always at the bottom of screen
            let zone = zones[k]
            let bench = this.props.G.benchs[player]
            let highlight=null;
            let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer]
            if (stage==="pickupBench" || stage==="playBench" ) {
                if (player===thisPlayerNumber && player===parseInt(this.props.ctx.currentPlayer) ) {
                    highlight = "green"
                } else if (player===parseInt(this.props.ctx.currentPlayer)) {
                    highlight = "white"
                }
            } 

            let phase = this.props.ctx.phase;
            let clickAction;
            if (phase === 'StartPhase') {
                clickAction = 'takeBench'
            } else if (stage==='playBench'){
                clickAction = 'playBench'
            } else {
                clickAction = 'pickupBench'
            };
                        
            for (let j=0; j<3; j++) {
                //find number of cards at postion. 
                let numAtPos = bench[j].length;
                for (let i=0; i<numAtPos; i++) {
                    let cardParams = CardRenderParam(x, y-i*yspace, this.state.cardwidth, this.state.cardheight, this.state.screenx, this.state.screeny, this.state.padx, this.state.pady, range, 3, zone, this.props.isMobile) //hard coded as 3 on purpose
                    let xcord; let ycord;
                    xcord=cardParams[j][0]
                    ycord=cardParams[j][1] 
                    switch (zone) { //adaptation to handle unique bench positioning
                        case "right":
                            xcord=this.state.screenx/2 + 7*this.state.cardheight/5 + this.state.cardwidth
                            break
                        case "left":
                            xcord=this.state.screenx/2 - 7*this.state.cardheight/5 - this.state.cardwidth
                            break
                        default:
                        break;
                    }

                    let rotation = cardParams[j][2];
                    let key = bench[j][i] !== null ? bench[j][i].name : `${player}bench${j}${i}`
                    cards.push(
                        <CardImage
                            reverse={i===0}
                            card={ bench[j][i] }
                            key = {key}
                            keyProp={key}
                            x={xcord} 
                            y={ycord} 
                            rotation={rotation}
                            width={this.state.cardwidth} 
                            height={this.state.cardheight}
                            player={player}
                            onClick={()=>this.clickCard(clickAction, j, player)}
                            shadowBlur={this.state.dropShadow}
                            onTap={()=>this.clickCard(clickAction, j, player)}
                            highlight={highlight}
                        />
                    )
                };
            };
        };
        return cards
    };

    renderDeck = (props) => {
        let deck = this.props.G.deck
        let thisPlayerNumber = parseInt(this.props.playerID); 
        let stage = this.props.ctx.activePlayers[thisPlayerNumber];
        let x = this.state.screenx/2 - 6*this.state.cardwidth/5;
        let y = this.state.screeny/2 - this.state.cardheight/2;
        let topcard = deck[deck.length -1]
        if (deck.length > 0) {
            let key = topcard !== null ? topcard.name : `deck`
            return (
                <CardImage 
                    key = {key}
                    keyProp={key}
                    card={topcard}
                    reverse={true} 
                    x={x} 
                    y={y} 
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    onClick={()=>this.clickCard('draw', null, thisPlayerNumber)}
                    onTap={()=>this.clickCard('draw', null, thisPlayerNumber)}
                    shadowBlur={this.state.dropShadow}
                    highlight={(stage==="draw" && this.props.G.hands[thisPlayerNumber].length < 3) ? "green" : null}
                />
            );
        } else {
            return (
                <CardImage 
                    card={null} 
                    key ={"emptyDeck"}
                    keyProp={"emptyDeck"}
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    x={x} 
                    y={y} 
                />
            );
        };
    };

    renderTable = (props) => {
        let table = this.props.G.table
        let thisPlayerNumber = parseInt(this.props.playerID); //the current player
        let stage = this.props.ctx.activePlayers[thisPlayerNumber];
        let x = this.state.screenx/2 + this.state.cardwidth/5;
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
            
            let renderedCards = [];
            for (let i=0; i<tableCardsToRender.length; i++) {
                let key = tableCardsToRender[i] !== null ? tableCardsToRender[i].name : `table${i}`

                renderedCards.push( 
                    <CardImage 
                        card={tableCardsToRender[i]} 
                        underInvisible={tableCardsToRender.length>1 && i===tableCardsToRender.length-1}
                        key ={key}
                        keyProp={key}
                        reverse={false} 
                        onClick={()=>this.clickTable()} 
                        onTap={()=>this.clickTable()}
                        width={this.state.cardwidth} 
                        height={this.state.cardheight}
                        x={x} 
                        y={y} 
                        shadowBlur={this.state.dropShadow}
                        highlight={stage==="pickup"? "green" : null}
                    />
                );
            }
            return renderedCards.reverse();
        } else if (this.props.G.magicEvent.type==="burning") {
            let card = "burnt"+this.props.G.lastPlayed.suit
            return (
                <CardImage 
                    card={card}
                    key ={card}
                    keyProp={card}
                    width={this.state.cardwidth} 
                    height={this.state.cardheight}
                    x={x} 
                    y={y} 
                />
               )
        } else {
           return (
            <CardImage 
                card={null} 
                key ={"emptyTable"}
                keyProp={"emptyTable"}
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
        let x = 3*this.state.screenx/4 
        let y = 3*this.state.screeny/4

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
        let x = this.state.screenx/4 
        let y = 3*this.state.screeny/4
        
        
        if ((stage==='play' || stage==='playBench') &&
        (numMoves >=1 || this.props.G.cutInInfo.playerCuttingIn === Number(this.props.playerID)) && 
        this.props.playerID === this.props.ctx.currentPlayer 
        && (this.props.G.magicEvent.type!=='burning' || hasTen)
        ) {
            return (
            <EndTurnButton
                onClick={()=>this.clickendTurnButton(props.player)} 
                onTap={()=>this.clickendTurnButton(props.player)}
                x={x}
                y={y}
                scale={this.state.cardScale}
            />)
        } else {
            return null;
        }
    }

    sevenChoiceButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let sep = 3.5*this.state.cardScale;
        let x = this.state.screenx/4 
        let y = 3*this.state.screeny/4
        
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

    
    renderInstructions = () => {
        let player = parseInt(this.props.playerID)
        let currentPlayer = this.props.ctx.currentPlayer
        let phase = this.props.ctx.phase;
        let stage = this.props.ctx.activePlayers[player]
        let x = 3*this.state.screenx/4 
        let y = 3*this.state.screeny/4
        let instruction = "waiting"
        
        if (stage==="draw" && this.props.G.hands[player].length < 3) {
            instruction = "playing"
        }

        if (player.toString() === currentPlayer) {
            instruction = "playing"
        }
        
        if (player.toString() === currentPlayer && stage==="draw" && this.props.G.hands[player].length > 3) {
            instruction = "waiting"
        }


        
            
        
        
        return( <Instructions
            currentPlayer={currentPlayer}
            phase={phase}
            instruction={instruction}
            player={player}
            numPlayers={this.props.ctx.numPlayers}
            scale={this.state.cardScale}
            x={x}
            y={y}
            isMobile={this.props.isMobile}
            playerNammes={this.state.playerNames}
            
        />)
    };

    
    renderGameInfo = () => {
        let matchData = this.props.matchData;
        let playerID = this.props.playerID;
        let matchID = this.props.matchID;

        if (DEBUGING_UI) {
            return (
                <Group>
                    <Text x={10} y={10} text={`player ${this.props.playerID}`} fontSize={15} />
                    <Text x={10} y={30} text={`mobile ${this.props.isMobile}`} fontSize={15} />
                </Group>
            )
        }
        return (
            <Group>
                <Text x={10} y={10} text={"player: ".concat(matchData[playerID].name)} fontSize={15} />
                <Text x={10} y={30} text={"Game: ".concat(matchID)} fontSize={15}/>
                <Text x={10} y={50} text={"Connected: ".concat(matchData[playerID].isConnected)} fontSize={15}/>
                <Text x={10} y={70} text={`mobile ${this.props.isMobile}`} fontSize={15} />
            </Group>
        );

    };

    renderGrid = () => {
        if (DEBUGING_UI) {
            let yline = [(this.state.screenx/2), (0), (this.state.screenx/2), (this.state.screeny)]
            let xline = [(0), (this.state.screeny/2), (this.state.screenx), (this.state.screeny/2)]
            return(
                <Layer>
                    {/* <Rect x={0} y={0} width={this.state.screenx-2*this.state.padx} height={this.state.screeny} fill="blue" /> */}
                    <Line points={yline} stroke="red" strokeWidth={3}/>
                    <Line points={xline} stroke="red" strokeWidth={3}/>
                </Layer>
            )
        } 
        return null;
    }

    EndOfGameOptions = () => {
        let thisPlayerNumber = parseInt(this.props.playerID);
        let playerPlayingAgain = false;
        for (let i=0; i<this.props.ctx.numPlayers; i++) {
            if (this.props.G.playingAgain[i]!==null && i === parseInt(this.props.playerID)) {
                playerPlayingAgain = true

            }
        } 
        
        if (playerPlayingAgain===false) {
            return (
                <div>
                    <div id="overlay"/>
                    <div id="EndScreen" >
                        <GameOver 
                            playerNames={this.state.playerNames}
                            winningOrder={this.props.G.winningOrder}
                            playerID={thisPlayerNumber}
                            isMobile={this.props.isMobile}
                        /> 
                        <div>
                            <button id="EndGameChoice" onClick={()=>this.handlePlayAgain(true)}>
                                play again
                            </button>
                            <button id="EndGameChoice" onClick={()=>this.handlePlayAgain(false)}>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            ) 
        } else if (this.state.showWaitingForOthers) {
            return (
                <div>
                    <div id="EndScreen" >
                    <GameOver 
                        playerNames={this.state.playerNames}
                        winningOrder={this.props.G.winningOrder}
                        playerID={thisPlayerNumber}
                        isMobile={this.props.isMobile}
                    /> 
                    </div>
                    <Pending text={"Waiting for others"} />
                </div> 
            )
        } else {
            return null;
        }
       
    }

    nameTags = () => {
        let nameTags = []
        let names = Array(this.props.ctx.numPlayers);
        let order = this.getPlayerOrder()
        for (let i=0; i<this.props.ctx.numPlayers; i++) {
           names[i] = this.state.playerNames[order[i+1]]
        }

        if (this.props.ctx.numPlayers === 3 ) {
            names =[names[1], names[0]];
        } else if ( this.props.ctx.numPlayers === 4 ) {
            names =[names[1], names[0], names[2]];
        }
        const style = (coords) => {
            return({
                position: "absolute",
                left: coords[0],
                bottom: coords[1],
                transform: coords[2],
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "2", 
                margin: "auto",      
                fontSize: `${this.state.cardScale*2.5}px`,
                color: " rgb(255, 255, 255)",
                opacity: "0.2",
                ":hover": {
                    opacity: "0.5"
                }
            })
        }
        let coords = [
            ["50%", `${this.state.screeny - this.state.cardheight/2}px` ,`rotate(0deg) translate(-50%, 0%)`], //top
            [`${this.state.screenx/2 - 7*this.state.cardheight/5 - 6*this.state.cardwidth/5}px`, "50%" ,`translate(-50%, 0%) rotate(90deg)`], //left
            [`${this.state.screenx/2 + 7*this.state.cardheight/5 + 6*this.state.cardwidth/5}px`,"50%" ,`translate(-50%, 0%) rotate(-90deg)`], //right
        ]

        for (let i=0; i<this.props.ctx.numPlayers-1; i++) {
            nameTags.push(
                <div 
                    key={names[i]}
                    id="nameTags"
                    style={style(coords[i])}
                >
                    {names[i]}
                </div> 
            )
        }
 
        return (
            nameTags
        )
    }
    
    render() {       
        let thisPlayerNumber = parseInt(this.props.playerID);
        let playerNames= [];
        if (!DEBUGING_UI) {playerNames = this.state.playerNames}
        if (this.props.ctx.phase === "EndPhase"  && DEBUGING_UI) {
            return (
                <div>
                 <h1> player {this.props.G.winningOrder[0]}  won! </h1>
             </div>
            )
        }
        
        if (this.props.ctx.phase === "EndPhase") {
            return (
                <div>
                    <Menu 
                        sendChatMessage={this.props.sendChatMessage}
                        chatMessages={this.props.chatMessages} 
                        playerNames={playerNames}
                        matchInfo={this.props.G.settings}
                        clientName={!DEBUGING_UI?this.props.matchData[this.props.playerID].name:'DEBUG'}
                        matchID={this.props.matchID} 
                        isMobile={this.props.isMobile}
                    /> 
                    <this.EndOfGameOptions />
                    <div id={DEBUGING_UI?"GameDebugView":"Game"}>
                    <Stage x={0} y={0} width={this.state.screenx} height={this.state.screeny}>
                            <this.renderGrid />
                            <Layer>
                                <this.renderDeck /> 
                                <this.renderTable />
                            </Layer>
                            <Layer>
                                <this.renderHand />
                                <this.renderBench />
                            </Layer>
                        </Stage>
                    </div>
                </div>
            );

         } else {
            return (
                <div>
                    <div>
                    <Menu 
                        sendChatMessage={this.props.sendChatMessage}
                        chatMessages={this.props.chatMessages} 
                        matchID={this.props.matchID} 
                        matchInfo={this.props.G.settings}
                        playerNames={playerNames}
                        clientName={!DEBUGING_UI?this.props.matchData[this.props.playerID].name:'DEBUG'}
                        isMobile={this.props.isMobile}
                    />
                    </div>
                    <div id={DEBUGING_UI?"GameDebugView":"Game"}>
                        <this.nameTags />
                        {this.props.G.settings.playOnafterWin && (
                        <FinishedMessage 
                            playerNames={playerNames}
                            winningOrder={this.props.G.winningOrder}
                            player={this.props.playerID}
                        />)}
                        <Stage x={0} y={0} width={this.state.screenx} height={this.state.screeny}>
                            <this.renderGrid />
                            <Layer>
                                <this.renderGameInfo />
                                <this.readyButton player={ thisPlayerNumber } />
                                <this.endTurnButton />
                                <this.sevenChoiceButton />
                                <this.renderInstructions/>
                                <this.renderBench />
                                <this.renderHand />  
                                <this.renderDeck /> 
                                <this.renderTable />
                            </Layer>
                            <Layer>
                            <SevenChoiceInstruction 
                                x={this.state.screenx/2 + 5.5*this.state.cardwidth/5} 
                                y={this.state.screeny/2} 
                                scale={this.state.cardScale} 
                                choice={(this.props.G.sevenHighLow === 'default') ? "" : this.props.G.sevenHighLow}
                                onClick={()=>this.clickTable()} 
                                onTap={()=>this.clickTable()}
                            />
                            </Layer>
                            <Layer>
                                <MagicEvent 
                                    magicEvent={this.props.G.magicEvent} 
                                    x={this.state.screenx/2} 
                                    y={this.state.screeny/2}
                                    scale={this.state.cardScale}
                                />
                                <CutInEvent 
                                    cutIn={this.props.G.cutInInfo} 
                                    x={this.state.screenx/2} 
                                    y={this.state.screeny/2}
                                    scale={this.state.cardScale}
                                />
                            </Layer>
                        </Stage>
                    </div>
                    {/* <div id ="table"/> */}
                </div>
            );
         };
    };
};

export default SHEDtable



/* 
table style div
<div style = {{
    backgroundImage: `url(${tablebackground})`,
    width: {this.state.screenx},
    height: {this.state.screeny}
}}></div>

 */