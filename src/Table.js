import React from 'react'
import {Layer, Rect, Stage, Text, Image} from 'react-konva';
import tablebackground from './images/tabletop.jpg'
import Instructions from './player';
import useImage from 'use-image';

var cardBackUrl = 'https://i.pinimg.com/564x/10/80/a4/1080a4bd1a33cec92019fab5efb3995d.jpg'

function CardImage(props) {  
    const [back] = useImage(cardBackUrl);
    return (
      <Image image={back} x={props.x} y={props.y} width={cardwidth} rotation = {props.rotation} height={cardheight} shadowBlur={15} player={props.player} onClick={props.onClick}/>
    );
  }
/* to do:

-stop bench playing from bottom layer if cards are on the top!!
-Bench ready up validation - put in phase called waiting when they have readied up where they cant do anything
----use played by to check if moves from / to bench!!!!!
other then re order the cards in their deck
-bug with burning 7's - need to check last card played -not the top of the table!!!!!
-the invisbile rendering is broke - use while instead

------ CHECK OVER MOVE VALIDATION ---> USING LAST PLAYED /TOP TABLE IN WRONG PLACES

just add the validatin in for these check when chcking play bench
    -end turn playing last card in top layer
    -enter this new stage at the start of the next turn
    only diff is that it if move invalid force card onto the table and then only let them pickup



-message displayer
-possible move checker - > show message each round showing currnt player turn
    -                  - > on your turn state if they cant go and show pass button to click

    Clean-up:
-figure out how to speerate render class methods - put in other js file
-UI convenience functions:
    -render button - pass in coords and onlick behaviour + props.choice=true --> can make selection
*/
const screenx = 1200;
const screeny = 800;
const padx = 50;
const pady = 100;
const cardwidth = 50;
const cardheight = 70;


export class SHEDtable extends React.Component {

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
    
  
    renderCard =  (props) => {
        let card = props.card
        if (card === null) {
            console.alarm('null card render attmepted')
            return null
        } else {
            let x = props.x;
            let y = props.y;
            let orientation = props.orientation
            let cardtext = card.name()
            let opacity = 1;

            //move card up a bit if invisble
            if (card.invisible && props.reverse===false) {
                opacity = 0.5
            }; 
            
            let xoffset; let yoffset; let rotation =0;
            if (orientation==='left'|| orientation==='right') {
                xoffset=-cardheight
                yoffset=cardwidth/2
                rotation=90
            } else if (orientation==='bottom' || orientation==='top'){
                xoffset=cardwidth/2
                yoffset=cardheight
                rotation=0
            } else {
                xoffset=cardwidth/2
                yoffset=cardheight
                rotation=0
            };
            
            
            if (props.reverse) {
                return(
                    <React.Fragment>
                    <CardImage x={x} y={y} width={cardwidth} rotation = {rotation} height={cardheight} fill={'blue'} shadowBlur={15} player={props.player} onClick={props.onClick}/>
                    </React.Fragment>
                    )
            } else {
                return(
                    <React.Fragment>
                    <Rect x={x} y={y} width={cardwidth} rotation={rotation} height={cardheight} opacity={opacity} fill={'red'} shadowBlur={15} player={props.player} onClick={props.onClick}/>
                    <Text x={x+xoffset} y={y+yoffset} rotation={rotation-90} opacity={opacity} text={cardtext} fontSize={18} />
                    </React.Fragment>
                    )
            };
        };
    };

    renderHand = (props) => {
        let player = props.player; //player who's hand is being rendered
        let thisPlayerNumber = parseInt(this.props.playerID); //the current player
        let hand = this.props.G.hands[player];
        let x = props.x; let y = props.y; let space = props.space;
        let orientation=props.orientation;
        let cards = [];

        for (let i= 0; i < hand.length; i++) {
            let xcord; let ycord;
            if (orientation==='left') {
                xcord = x + padx
                ycord = y+(i*space) - screeny + pady + cardwidth
            } else if (orientation==='right') {
                xcord = x + screenx - cardheight
                ycord = y+(i*-space) - cardwidth
            } else if (orientation==='bottom') {
                xcord = x+(i*space)
                ycord = y
            } else if (orientation==='top') {
                xcord = x+(i*-space) + screenx - padx - cardheight
                ycord = y+pady-screeny+cardheight/2
            } else {
                xcord = x+(i*space)
                ycord = y
            };

            //define click type for bench setting stage and normal game play
            let phase = this.props.ctx.phase;
            let clickAction;
            if (phase === 'StartPhase') {clickAction = 'addBench'} else {clickAction = 'play'};

            cards.push(
            <this.renderCard
            key={i}
            card={hand[i]}
            orientation={orientation}
            reverse={player!==thisPlayerNumber}
            player={player}
            x={xcord}
            y={ycord}
            onClick={()=>this.clickCard(clickAction, i, player)}
            />)
        }
        return cards
    };

    renderBench = (props) => {
        let player = props.player; //the players cards being rendered
        let bench = this.props.G.benchs[player]


        let x = props.x; let y = props.y; let xspace = cardwidth+20; let yspace = 20; let orientation=props.orientation
        let padbench = 20;
        let cards=[];

        //define click type for bench setting stage and normal game play
        let phase = this.props.ctx.phase;
        let clickAction;
        if (phase === 'StartPhase') {clickAction = 'takeBench'} else {clickAction = 'playBench'};
        
        
        
        for (let j=0; j<3; j++) {
            //find number of cards at postion.
            let numAtPos = bench[j].length;
        
            for (let i=0; i<numAtPos; i++) {
                let xcord; let ycord;
                if (orientation==='bottom') {
                    xcord = x + (j*xspace) + screenx/2 - xspace -padx -cardwidth 
                    ycord = y + (i*yspace) - pady - padbench
                } else if (orientation==='top') {
                    xcord = x + (j*xspace) + screenx/2 - xspace -padx -cardwidth 
                    ycord = y + (i*-yspace) + pady - screeny + cardheight + xspace +padbench
                } else if (orientation==='left') {
                    xcord = x + (i*-yspace) + 200
                    ycord = y + (j*xspace) -screeny/2
                } else if (orientation==='right') {
                    xcord = x + (i*yspace) + screenx - padx - cardheight -xspace - padbench
                    ycord = y + (j*xspace) -screeny/2
                };


            
                cards.push(
                    <this.renderCard 
                    reverse={i===0}
                    card={ bench[j][i] }
                    x={xcord} 
                    y={ycord} 
                    orientation={orientation} 
                    player={player}
                    onClick={()=>this.clickCard(clickAction, j, player)}/>)
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
            return <this.renderCard card={topcard} reverse={true} x={x} y={y} onClick={()=>this.clickCard('draw')}/>
        } else {
            return <Text x={x} y={y+50} text={"deck\n(empty)"} fontSize={20} />
        };
    };

    renderTable = (props) => {
        let table = this.props.G.table
        let x = props.x;
        let y = props.y;
        let tableCardsToRender = [];
       
        
        //recursivly get invisible stacked cards to show bottom most
        function getTableCards(table, position) { 
            let thiscard = table[position];
            tableCardsToRender.push( thiscard )
            if (thiscard.invisible && position >=1) {
                getTableCards(table, (position-1), tableCardsToRender)
            } else { return };
        };
        
        if (table.length > 0) {
            
            getTableCards(table, (table.length-1))
            let renderedCards = [];
            for (let i=0; i<tableCardsToRender.length; i++) {
                renderedCards.push( <this.renderCard card={tableCardsToRender[i]} onClick={()=>this.clickTable()} x={x} y={y}/> );
            }
            return renderedCards.reverse();
        } else {
           return <Text x={x} y={y+50} text={"table\n(empty)"} fontSize={20} />
        };
    };

    renderPlayerUI = (props) => {
        let playerUIelements = null;
        
        if (this.props.ctx.currentPlayer===0) {
            playerUIelements = <React.Fragment> 
                
                </React.Fragment> 
        }
        return playerUIelements;
    };
    

    

    renderPlayerLayer = (props) => {
        //choose what player to render 
        let x = props.x;
        let y = props.y;
        let orientation = props.orientation;
        
        

        return (
            <React.Fragment>
                <this.renderHand x={x} y={y} orientation={orientation} space={80} player={props.player}/> 
                <this.renderBench x={x} y={y} orientation={orientation} player={props.player}/>
            </React.Fragment> 
        )
    };
    
    renderAllPlayers = () => {
        let numPlayers = this.props.ctx.numPlayers
        let thisPlayerNumber = parseInt(this.props.playerID);
        let playerCards = [];
        let zones =['bottom', 'top', 'left', 'right'];
        
        //get player order to render the cards in
        let playerOrder = [0, 1, 2, 3].slice(0, numPlayers);
        for (let i=0; i<thisPlayerNumber; i++) {
            let front = playerOrder.shift()
            playerOrder.push(front)
        };

        //now render using the player order
        for (let i=0; i<numPlayers; i++) {
            playerCards.push(
                <this.renderPlayerLayer x={padx} y={screeny-pady} orientation={zones[i]} player={playerOrder[i]}/>  
            )
        };
        return playerCards
    };

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
            return (<React.Fragment>
                <Rect x={screenx/2 - 60} y={screeny/2-cardheight/2 + 150} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clickReadyButton(props.player)}
                    />
                    <Text x={screenx/2 - 60} y={screeny/2-cardheight/2 + 150} align={'center'} text={'Ready'} fontSize={25} fill={'black'} />
            </React.Fragment>)
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
        let y =screeny - pady -cardheight;
        let colour = 'white';
        
        if ((stage==='play' || stage==='playBench') && numMoves >=1 && benchTot >3 && this.props.playerID === this.props.ctx.currentPlayer) {
            return (<React.Fragment>
                <Rect x={x} y={y} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clickendTurnButton(props.player)}
                    />
                    <Text x={x} y={y+10} align={'center'} text={'End Turn'} fontSize={25} fill={'black'} />
            </React.Fragment>)
        } else {
            return null;
        }
    }

    sevenChoiceButton = (props) => {
        let stage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        let x = padx;
        let y = screeny - pady - cardheight;
        let width = 100;
        let height = 50;
        let sep = 20;
        let fontsize = 25;
        let colour = 'white';
        
        if (stage==='sevenChoice' && this.props.playerID === this.props.ctx.currentPlayer) {
            return (<React.Fragment>
                    <Rect x={x+sep+width} y={y} width={width} height={height} fontSize={fontsize}
                    fill={colour} cornerRadius={20} onClick={()=>this.clicksevenChoiceButton('higher', props.player)}/>
                    <Text x={x+sep+width} y={y+10} align={'center'} text={'higher'} fontSize={25} fill={'black'} />

                    <Rect x={x} y={y} width={100} height={50} fontSize={25}
                    fill={colour} cornerRadius={20} onClick={()=>this.clicksevenChoiceButton('lower', props.player)}/>
                    <Text x={x} y={y+10} align={'center'} text={'lower'} fontSize={25} fill={'black'} />
            </React.Fragment>)
        } else {
            return null;
        }
    }

    renderInstructions = (props) => {
        let player = parseInt(this.props.playerID)
        let text = Instructions(this.props.G, this.props.ctx, player);
        
        let width = 200;
        let height = 50;
        let x = screenx - padx -width - cardwidth*2;
        let y = screeny - pady - cardheight*2;
        let fontsize = 25;
        let colour = 'white';
        
        return(<React.Fragment>
            <Rect x={x} y={y} width={width} height={height}
                fill={colour} cornerRadius={10}
                />
                <Text x={x} y={y+10} align={'center'} text={text} fontSize={fontsize} fill={'black'} />
        </React.Fragment>)
    };
    
    render() {
        //loop over all 4 players and render them accordingly
        let thisPlayerNumber = parseInt(this.props.playerID);
        let Gameover = this.props.ctx.gameover;
        console.log('Gameover: ', Gameover)
         if (Gameover !== undefined) {
             return (
                <div>
                 <h1> player {Gameover.winner}  won! </h1>
             </div>
             );

         } else {
            return (
                <React.Fragment>
                <div style = {{
                    backgroundImage: `url(${tablebackground})`,
                    width: {screenx},
                    height: {screeny}
                    }}>
                    <Stage width={screenx} height={screeny}>
                        <Layer>
                            <React.Fragment>
                            <Text x={10} y={10} text={thisPlayerNumber} fontSize={25}/>  
                            <this.renderDeck x={screenx/2 - 60} y={screeny/2-cardheight/2} rotation={0} /> 
                            <this.renderTable x={screenx/2 + 60} y={screeny/2-cardheight/2} rotation={0} />
                            <this.readyButton player={ thisPlayerNumber} />
                            <this.endTurnButton />
                            <this.sevenChoiceButton />
                            <this.renderInstructions/>
                            </React.Fragment >
                        </Layer>
                        <Layer>
                            <this.renderAllPlayers/>
                        </Layer>
                    </Stage>
                </div>
                </React.Fragment>
               );
         }

        
    }
}

/*
<this.renderPlayerLayer x={padx} y={screeny-pady} orientation={'left'} player={0}/>
 */