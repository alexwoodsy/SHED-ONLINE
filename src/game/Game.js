import { INVALID_MOVE } from 'boardgame.io/core';


// VARS TO CHNAGE FOR DEBUGGING 
var cardsInHand = 3; //default 3
var emptyDeck = false; //false
var handOf = null; //default null


export const SHED = {
    name: 'SHED',
    setup: ctx => ({ 
        deck: GetDeck(),
        hands: Array(ctx.numPlayers).fill(Array(0)),
        benchs: Array(ctx.numPlayers).fill(Array(3).fill(Array(2))),
        table: Array(0),
        Ready: Array(ctx.numPlayers).fill(0),
        sevenHighLow: 'default', //can be: default - higher - lower
        lastPlayed: null,
        magicEvent: {"type": null, "count":0},
        hasTen: false,
                
     }),

    turn: {
        moveLimit: 1,
    },


    phases: {
        StartPhase:{
            start: true,
            next:'MainPhase',
            onBegin: (G, ctx) => {
                G.deck = ctx.random.Shuffle(G.deck);
                initHand(G, ctx);
                initBench(G, ctx);
                if (emptyDeck===true) {G.deck = []};//DEBUGGING: SET TO empty}
                ctx.events.setActivePlayers({
                    all: 'settingBench'
                });
            },
            

            turn: {
                stages: {
                    settingBench: {
                        start: true,
                        moves: {
                            TakeBench,
                            AddBench,
                            ReadyUp,
                        },
                    },
                },
            },
        },

        MainPhase:{
            turn: { //if this doesnt work, try moving all logic away and just calling a function that sets this
                onBegin: (G, ctx) => { 
                   
                    if (G.hands[ctx.currentPlayer].length > 0) {
                        if ( CanPlay(G, ctx) ) {
                            ctx.events.setActivePlayers({currentPlayer: 'play'});
                        } else {
                            ctx.events.setActivePlayers({currentPlayer: 'pickup'});
                        };
                    } else {
                        // if (BenchPlayable(G, ctx).positions.length !==0) was remove from else above
                        // console.log('BPlayer', BenchPlayable(G, ctx).layer)
                        // console.log('BP pos', BenchPlayable(G, ctx).positions)
                        //     console.log('onbegin', CanPlayBench(G, ctx))
                        if ( CanPlayBench(G, ctx) || BenchPlayable(G, ctx).layer ===0){
                            ctx.events.setActivePlayers({currentPlayer: 'playBench'});
                        } else {
                            ctx.events.setActivePlayers({currentPlayer: 'pickup'});
                        };
                    };
                },
                onEnd: (G, ctx) => {
                    orderHand(G, ctx)
                },
                
                stages: { 
                    pickup:{
                        moveLimit: 1,
                        moves: {PickupTable},
                    },
                    play: {
                        moveLimit: 4,
                        moves: {PlayCard, EndPlay}, //add pick up the pile here
                    },
                    playBench: {
                        moveLimit: 4,
                        moves: {PlayBench, EndPlay},
                    },
                    sevenChoice: {
                        moveLimit: 1,
                        moves: {SevenChoice},
                    },
                    draw: {
                        moveLimit: 4,
                        moves: {DrawCard},
                    },
                },
            },
        },
    },
  };



//card class
export class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.invisible = (this.rank===3);
        this.magic = this.magic()
        this.name = this.name()
        this.LastPlayedBy = null;
        this.turnPlayedOn = null;
        this.currentLocation = null;
        this.LastLocation=null;
    }  
    name() {
        return this.rank.toString().concat(" ",this.suit);
    };

    magic() {
        let magic = [2, 3, 10]; //ranks of the magic cards - 7 not included -> DAN mode add 7 in this array 
        let magicCheck = false;
        for (let i=0; i < magic.length; i++) {
            if (magic[i] === this.rank) {
                magicCheck = true
            };
        }
        return magicCheck
    }; 
   
    set playedBy (player) {
        this.LastPlayedBy = player;
    }
    set turnPlayed (turn) {
        this.turnPlayedOn = turn;
    }

   set location (newLocation) {
    let curLoc = this.currentLocation
    this.currentLocation= newLocation
    this.LastLocation = curLoc;
        

        // switch(newLocation){
        //     case 'deck':    
        //     case 'table':
        //     case 'bench':
        //     case 'hand':
        //         let current = this.currentLocation;
        //         this.LastLocation = current;
        //         this.currentLocation = newLocation
        //         break;
        //     default:
        //         console.error('card moved to an unknown location', newLocation)
        // };
    }
}

function orderHand(G, ctx) {
    G.hands[ctx.currentPlayer] = G.hands[ctx.currentPlayer].sort(function (a, b) {
        return a.rank - b.rank;
    }); 
}

function GameOver(G, ctx) {
    //game is over
    ctx.events.endGame({winner: ctx.currentPlayer})
}


function GetDeck() {
    let suits = ["hearts", "diamonds", "spades", "clubs"];
    let ranks = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let deck = []
        for (let i=0; i < suits.length; i++) {
            for (let j=0; j < ranks.length; j++) {
                let card = new Card(suits[i], ranks[j]);
                card.location = 'deck'
                deck.push( card ) 
            }
        }
        return deck
}

function initBench (G, ctx) {
   for (let id=0; id < ctx.numPlayers; id++){
       for (let pos=0; pos < 3; pos++) {
        for (let order=0; order < 2; order++) {
            let card = G.deck.pop(); 
            card.location = 'bench';
            G.benchs[id][pos][order] = card;
        };
       }; 
   };
};

function initHand (G, ctx) {
    for (let id=0; id < ctx.numPlayers; id++){
        if (handOf !== null && id===0) { //for debugging player zero hand all to one suit
            for (let i=0; i<G.deck.length; i++) {
                if (G.deck[i].rank === handOf) {
                    let card = G.deck.splice(i, 1)[0]
                    card.location = 'hand';
                    G.hands[id].push( card )
                }
            }
        } else {
            for (let pos=0; pos < cardsInHand; pos++) {
                let card = G.deck.pop();
                card.location = 'hand';
                G.hands[id].push( card )
            };
        }
    };
};


function PickupTable(G, ctx) {
    let cards = G.table;
    cards.forEach(card => {
        card.location= 'hand'
    });
    G.hands[ctx.currentPlayer] = G.hands[ctx.currentPlayer].concat(cards);
    G.table = [];
    G.lastPlayed = null; //Incase someone picks up -------------------------------------was changed - if stuff is broke then comment out again
    ShouldMagicEventReset(G, ctx)
    ctx.events.endTurn();
};


//draw the card from deck and add the end of hand
function DrawCard(G, ctx) {
    let card = G.deck.pop();
    card.location = 'hand'
    G.hands[ctx.currentPlayer].push( G.deck.pop( card ) )  
    //console.log("added to hand")

    if (G.hands[ctx.currentPlayer].length >=3) {ctx.events.endTurn()}
    
}
  
  //later need to update to allow playing of more than 1 card - should be anmother function that calls this one
function PlayCard(G, ctx, position) {
    
    let card = G.hands[ctx.currentPlayer][position]
    if ( MoveValid(G, ctx, card) ) {
        let card = G.hands[ctx.currentPlayer].splice(position, 1)[0]
        

        card.playedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        card.location = 'table'
        //add to last played for movevalid / ui decision checks
        G.lastPlayed = card;
        ShouldMagicEventReset(G, ctx)

        if (card.rank !== 3) {
            G.sevenHighLow = 'default'
        }
        
        //add to table
        G.table = G.table.concat( card )
        //console.log("added to table") 

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }
        
        //update whether the player has a ten in his hand for later checks
        G.hasTen = hasTen(G, ctx)

        
        //end of play behaviour
        //console.log('can play again?', CanPlayAgain(G, ctx))
       if (CanPlayAgain(G, ctx) === false) {
           //let topCard = G.table[G.table.length-1]
           //update gamestate if card(s) played have magic behaviour
          // console.log('cant play again')
            EndPlay(G, ctx); 
       }; 

       //hanle playing last card in hand 
       if (G.hands[ctx.currentPlayer].length===0 && (BenchPlayable(G, ctx).layer===0 && BenchPlayable(G, ctx).positions.length ===0)) {
            GameOver(G, ctx);
       } else if (G.hands[ctx.currentPlayer].length===0 && G.deck.length===0) {
           ctx.events.setStage('playBench')
       } else if (G.hands[ctx.currentPlayer].length===0) {
           EndPlay(G, ctx);
       }

       

    } else {
        return INVALID_MOVE;
    };
  };



//add card in bench postion to hand - add null in to sill space where card was
function TakeBench(G, ctx, player, position) {
    let benchPoslen = G.benchs[player][position].length
    if (benchPoslen !== 1) {
        let card = G.benchs[player][position].pop()
        // = ctx.currentPlayer //used to check if taken from bench - removed because this behaviour is not right + set last played wrong!
        card.location='hand'
        G.hands[player].push( card ) 
    };
};

//add card in hand to the bench
function AddBench(G, ctx, player, position) {
    let freeBenchPos = null;
    //find free space on the bench to add the card
    for (let i=0; i<3; i++) {
        let benchPoslen = G.benchs[player][i].length
        if (benchPoslen < 2) {
            freeBenchPos = i
        };
    };
    
    if (freeBenchPos !== null ) { //&& G.hands[player][position].LastPlayedBy===null - removed this functionallity
        let card = G.hands[player].splice(position, 1)[0]
        card.location = 'bench'
        G.benchs[player][freeBenchPos].push( card )
        
        //console.log('adding to bench')
    } else {
        return INVALID_MOVE;
    };
};

function PlayBench(G, ctx, position) {
    //G.magicEvent.type = null//reset before turn 
    let PlayablePositions = BenchPlayable(G, ctx).positions;
    //console.log('playable pos', PlayablePositions)
    let StartLayer = BenchPlayable(G, ctx).layer;
    let section = G.benchs[ctx.currentPlayer][position];
    let card = section[section.length-1];
    
    //make sure they are not playing from bottom if top remains
    
    let correctLayer = false;
    for (let i=0; i<PlayablePositions.length; i++) {
        console.log('bench playable checking', position, PlayablePositions[i] )
        if (position===PlayablePositions[i]) {correctLayer = true}
    }

    //console.log('correct layer:', correctLayer)
    if ( MoveValid(G, ctx, card) && correctLayer) {
        //play the card
        let card = G.benchs[ctx.currentPlayer][position].pop()
        card.location = 'table'
        card.playedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        G.lastPlayed = card;
        G.table.push( card ) 
        ShouldMagicEventReset(G, ctx)

        if (card.rank !== 3) {
            G.sevenHighLow = 'default'
        }

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }

        //update whether the player has a ten in his hand for later checks
        G.hasTen = hasTen(G, ctx)

        if (BenchPlayable(G, ctx).layer===0 && BenchPlayable(G, ctx).positions.length ===0) {
            GameOver(G, ctx);
        } else if (CanPlayAgainBench(G, ctx) === false) {
            EndPlay(G, ctx); 
        }

    } else {
        if (StartLayer===1) {
            //console.log('move on top layer is invalid')
            return INVALID_MOVE;
        } else if (StartLayer===0) {
            card.playedBy = ctx.currentPlayer;
            card.turnPlayed = ctx.turn;
            
            G.table.push( G.benchs[ctx.currentPlayer][position].pop() ) 
            //do not do magic in this case
            ctx.events.setStage('pickup')
            //console.log('card was not valid move so now pickup')
        }
        
    };
}

function BenchPlayable(G, ctx) { //returns the postions and the layer from which bench cards can be played 
    //get cards in bench playable
    let bench = G.benchs[ctx.currentPlayer];
    let topRowFilled = [];
    let bottomRowFilled = [];

    for (let j=0; j<3; j++) {
        let numAtPos = bench[j].length;
        if (numAtPos === 2) {
            topRowFilled.push(j)
            bottomRowFilled.push(j)
        } else if (numAtPos === 1) {
            bottomRowFilled.push(j)
        };
    };

    if (topRowFilled.length > 0) {
        return {layer: 1, positions: topRowFilled};
    } else {
        return {layer: 0, positions: bottomRowFilled};
    };
}


function ReadyUp(G, ctx, readyPlayer) {
    //toggle the button through gamestate
    if (G.Ready[readyPlayer] === 1) {
        G.Ready[readyPlayer] = 0;
    } else {
        G.Ready[readyPlayer] = 1;
    }


    //now check all are ready
    let checkval = 0;
    for (let i=0; i < G.Ready.length; i++) {
        if (G.Ready[i]===1) {checkval ++} 
    };
    if (checkval===ctx.numPlayers) {
        ctx.events.endPhase()
    };
};

function EndPlay(G, ctx) {
    MoveIsMagic(G, ctx)
    let stage = ctx.activePlayers[ctx.currentPlayer];
    if (stage==='play') {
        if (G.lastPlayed.rank === 7 && G.magicEvent.type !== 'burning') {
            ctx.events.setStage('sevenChoice')
        } else if (G.hands[ctx.currentPlayer].length >=3 || G.deck.length===0) {
            ctx.events.endTurn();
        } else {
            ctx.events.setStage('draw')               
        };
    } else if (stage==='playBench') {
        if (G.lastPlayed.rank === 7) {
            ctx.events.setStage('sevenChoice')
        } else  {
            ctx.events.endTurn();
        }// else {
        //     ctx.events.setStage('draw')  //if (BenchPlayable(G,ctx).positions.length > 0)              
        // };
    }; 
};

function SevenChoice(G, ctx, choice) {
    G.sevenHighLow = choice;
    if (G.deck.length === 0) {
        ctx.events.endTurn();
    } else if (G.hands[ctx.currentPlayer].length >=3) {
        ctx.events.endTurn();
    } else {
        ctx.events.setStage('draw');
    }
    
};

function MoveValid(G, ctx, card) {
    let table = G.table; 
    let checkval = true;
    if (table.length > 0) {
        //gets card under 3's
        let topCard = table[table.length-1]
        let lastNormCard=null;
        let i=table.length-1;
        while (i>=0) {
            if (table[i].invisible === false) {
                lastNormCard=table[i]
                break;
            }
            i--;
        };
        
        
        if ((G.lastPlayed.LastPlayedBy===ctx.currentPlayer)  ) {//needs to be last played incase burns && (G.lastPlayed.turnPlayedOn===ctx.turn)
            if (G.lastPlayed.rank !== card.rank) {checkval = false}

        } else if (card.magic === false) {
            if (topCard.invisible) {
                if (lastNormCard!==null) { //if only invis we dont need to check this
                    if (lastNormCard.rank === 7 ) {  
                        if ( (card.rank > 7 && G.sevenHighLow === 'lower') || (card.rank < 7 && G.sevenHighLow === 'higher') ) {
                            checkval = false;
                        } 
                    } else if (lastNormCard.rank > card.rank) {
                        checkval = false;
                    };
                };
            } else if (topCard.rank === 7 ) {
                if ( (card.rank > 7 && G.sevenHighLow === 'lower') || (card.rank < 7 && G.sevenHighLow === 'higher') ) {
                    checkval = false;
                } 
            } else if (topCard.rank > card.rank) { //removed table > 0 as redundant
                checkval = false; 
            };       
        };
    
        
    };
   //console.log('move valid', checkval)
    //valid unless a check above says otherwise
    return checkval;
};



//retrun true if player has card in hand with rank = to the one they just played 
function CanPlayAgain(G, ctx) { 
    let cards=G.hands[ctx.currentPlayer]
    //let hand = G.hands[ctx.currentPlayer];
    let chekval = false;
    if (G.lastPlayed === null || (G.magicEvent.type==='burning' )) {
        chekval = true;
    } else {
        for (let i=0; i < cards.length; i++) {
            // if (cards[i].rank===G.lastPlayed.rank ) {
            //     console.log('play again cards', cards[i].rank)
            //     chekval = true
            // } removed as a test
            if (MoveValid(G, ctx, cards[i])) {
                chekval = true
            }
        }; 
    };
    return chekval;
};

function CanPlay(G, ctx) {
    let checkval = false;
    if (G.lastPlayed === null) {
        checkval = true;
    } else { //has to be here as othrwise doing a check at start when no-one is in a stage
        let cards=G.hands[ctx.currentPlayer]
        for (let i=0; i < cards.length; i++) {
            let card = cards[i];
            if ( MoveValid(G, ctx, card) ) {checkval = true}
        };
    };
    return checkval;
};

function CanPlayBench(G, ctx) {
    let checkval = false;

    if (G.lastPlayed === null ) {
        checkval = true;
    } else {
        let postions = BenchPlayable(G, ctx).positions;
        let layer = BenchPlayable(G, ctx).layer;
        for (let i=0; i<postions.length; i++) {
            let card = G.benchs[ctx.currentPlayer][postions[i]][layer];
            if ( MoveValid(G, ctx, card) ) {checkval = true}
        };
    };
    return checkval;
}

function CanPlayAgainBench(G, ctx) {
    let postions = BenchPlayable(G, ctx).positions;
    let layer = BenchPlayable(G, ctx).layer;
    let checkval = false;

    if (G.lastPlayed === null ) { //changed from table check
        checkval = true;
    }else if (layer===0) {
        if (G.magicEvent.type==='burning') {
            checkval = true;
        }
    } else {
        
        for (let i=0; i<postions.length; i++) {
            let card = G.benchs[ctx.currentPlayer][postions[i]][layer];
            if ( MoveValid(G, ctx, card) ) {checkval = true}
        };
    }
    return checkval;
}




//return event type to log the moves made - needed for the invisible check when checking move validity
function MoveIsMagic(G, ctx) {
    let movetype = null //default
    let table=G.table
    if (table.length !==0) {
        let topCard = table[table.length-1]
        //console.log('table',table,'topcard',topCard)
        //determinie movetype from top card on table
        //console.log
        // if (topCard.magic) {
             movetype = topCard.rank
        // };

        //if its a seven then just set magicevent but dont retrun move is magic

        if (canBurn(G, ctx)===true ) { movetype ='burn'}
        switch(movetype) {
            case 10:
            case 'burn':
                burnTable(G, ctx)
                break;
            case 7:
                G.magicEvent.type = 'Higher or lower'
                G.magicEvent.count++
                //dont need to do anything - handled by game logic
                break;
            case 3:
                G.magicEvent.type = 'Invisible'
                G.magicEvent.count++
                break;
            case 2:
                //no action needed for 2 reset as no cards lower than 2
                G.magicEvent.type = 'reset'
                G.magicEvent.count++
                break
            default: //when movetype is null due card being normal
                //console.log('standard')
                G.magicEvent.type = null
                G.magicEvent.count = 0
                break // do nothing - allow us to track magic events 
        };
    }
    
    //return movetype;
};

function burnTable(G, ctx) {
    G.table = [];
    G.magicEvent.type = 'burning'
    G.magicEvent.count++
}


function canBurn(G, ctx) {
    //check if there are 4 of the same played - burn if so 
    let table = G.table;

    if (table[table.length-1].rank===10) {
        return true;
    }

    let tableRanks = [];
    for (let i=0; i < table.length; i++) {
        tableRanks.push( table[i].rank );
    }
    const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    let ranks =[2,3,4,5,6,7,8,9,10,11,12,13,14];
    for (let i=0; i < ranks.length; i++) {
        if(countOccurrences(tableRanks, ranks[i]) === 4) {return true;};
    }
    return false;
}

function hasTen (G, ctx) { //has a ten in the same collection as intially played from
    //console.log('ten last played', G.lastPlayed.LastLocation)
    let stage = ctx.activePlayers[ctx.currentPlayer]
    
    if (stage === 'play') {
        console.log('checking hands and player', ctx.currentPlayer)
        let cards=G.hands[ctx.currentPlayer]
            for (let i=0; i < cards.length; i++) {
                let card = cards[i];
                if ( card.rank===10 ) {
                    console.log('has ten in hand')
                    return true}
            }
    } else if (stage === 'playBench'){ //check the bench for a ten
        //if on top layer - look on to layer
        console.log('checking bench and player',ctx.currentPlayer)
        if (BenchPlayable(G, ctx).layer===1 && G.lastPlayed.LastLocation === 'bench') {
            let postions = BenchPlayable(G, ctx).positions;
            for (let i=0; i<postions.length; i++) {
                let card = G.benchs[ctx.currentPlayer][postions[i]][1];
                if ( card.rank===10 ) {
                    console.log('has ten in bench')
                    return true}
            };
        }     
    }
    return false;
}

function ShouldMagicEventReset (G, ctx) {
    if (G.lastPlayed === null) {
        G.magicEvent = {type: null, count:0}
        G.sevenHighLow = 'default'
    } else if (G.lastPlayed.rank!==3) {
        G.magicEvent = {type: null, count:0}
        G.sevenHighLow = 'default'
    }
}



// function canEndTurnAfterBurn (G, ctx) {//returns true when the button for ending play should be shown
//     let haveTen = false; //return true ONLY if they just burnt and have a 10





//     


//         //if on the bottom - do nothing
//     }  
    
//     let notBurningCheck = !(G.magicEvent==='burning') || haveTen
//     console.log('haveTen',haveTen,'noBurning',notBurningCheck)

//     G.canEndTurnAfterBurn = (notBurningCheck)
 
// }


export default SHED;