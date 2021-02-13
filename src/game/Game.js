import { INVALID_MOVE } from 'boardgame.io/core';


// VARS TO CHNAGE FOR DEBUGGING 
var cardsInHand = 3;
var emptyDeck = false;


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
        magicEvent: null,
        
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
                initBench(G, ctx);
                initHand(G, ctx);
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
        switch(newLocation){
            case 'deck':    
            case 'table':
            case 'bench':
            case 'hand':
                this.LastLocation = this.currentLocation;
                this.currentLocation = newLocation
                break;
            default:
                console.error('card moved to an unknown location', newLocation)
        };
    }
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
        for (let pos=0; pos < cardsInHand; pos++) {
            let card = G.deck.pop();
            card.location = 'hand';
            G.hands[id].push( card )
        };
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
        card.playedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        card.location = 'table'
        //add to last played for movevalid / ui decision checks
        G.lastPlayed = card;
        
        //add to table
        G.table = G.table.concat(G.hands[ctx.currentPlayer].splice(position, 1))
        //console.log("added to table") 

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }
        
        //end of play behaviour
        //console.log('can play again?', CanPlayAgain(G, ctx))
       if (CanPlayAgain(G, ctx) === false) {
           //let topCard = G.table[G.table.length-1]
            //update gamestate if card(s) played have magic behaviour
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx); 
       }; 

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
        G.benchs[player][freeBenchPos].push( G.hands[player][position] )
        G.hands[player].splice(position, 1)
        //console.log('adding to bench')
    } else {
        return INVALID_MOVE;
    };
};

function PlayBench(G, ctx, position) {
    let PlayablePositions = BenchPlayable(G, ctx).positions;
    //console.log('playable pos', PlayablePositions)
    let StartLayer = BenchPlayable(G, ctx).layer;
    let section = G.benchs[ctx.currentPlayer][position];
    let card = section[section.length-1];
    
    //make sure they are not playing from bottom if top remains
    
    let correctLayer = false;
    for (let i=0; i<PlayablePositions.length; i++) {
        //console.log('bench playable checking', position, PlayablePositions[i] )
        if (position===PlayablePositions[i]) {correctLayer = true}
    }

    //console.log('correct layer:', correctLayer)
    if ( MoveValid(G, ctx, card) && correctLayer) {
        //play the card
        card.playedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        G.lastPlayed = card;
        G.table.push( G.benchs[ctx.currentPlayer][position].pop() ) 

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }

        //next step logic
        //dont let play again if played last card in top layer
        let CurrentLayer = BenchPlayable(G, ctx).layer;
        let currentPlayablePositions = BenchPlayable(G, ctx).positions;
        //console.log('bench playable after',position, currentPlayablepos )

        if (CurrentLayer!==StartLayer) { //check if the move should end
            //console.log('ending turn as cant play from top and bottom')
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx);
        } else if (CurrentLayer===0 && currentPlayablePositions.length ===0) {
            GameOver(G, ctx);
        } else if (CanPlayAgainBench(G, ctx) === false && CurrentLayer===1) { //only do this check if in the top layer
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx);
        } else if (CurrentLayer===0) {
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx);
        } else {
            //console.log('can PLAY Again from the TOP row ') ///DEBUGGING
            //burn instantly deck if card was a 10
            if (G.table.length > 0) {
                if (G.table[G.table.length-1].rank === 10) {
                    burnTable();
                }
            };
        };
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
    let stage = ctx.activePlayers[ctx.currentPlayer];
    if (stage==='play') {
        if (G.lastPlayed.rank === 7) {
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
    if (G.lastPlayed === null) {
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
    let table = G.table;
    let checkval = false;

    if (table.length === 0) {
        checkval = true;
    } else {
        let postions = BenchPlayable(G, ctx).positions;
        let layer = BenchPlayable(G, ctx).layer;
        for (let i=0; i<postions.length; i++) {
            let card = G.benchs[ctx.currentPlayer][postions[i]][layer];
            if ( MoveValid(G, ctx, card) ) {checkval = true}
        };
    }
    return checkval;
}




//return event type to log the moves made - needed for the invisible check when checking move validity
function MoveIsMagic(G, ctx) {
    let table=G.table
    let topCard = table[table.length-1]
    let movetype = null //default 
    
    //determinie movetype from top card on table
    if (topCard.magic) {
        movetype = topCard.rank
    };

    
    if (canBurn(G, ctx)===true ) { movetype ='burn'}
 
    
    switch(movetype) {
        case 10:
        case 'burn':
            burnTable(G, ctx)
            break;
        case 7:
            G.magicEvent('Higher or lower')
            //dont need to do anything - handled by game logic
            break;
        case 3:
            G.magicEvent = 'Invisible'
            break;
        case 2:
            //no action needed for 2 reset as no cards lower than 2
            G.magicEvent = 'reset'
            break
        default: //when movetype is null due card being normal
            //console.log('standard')
            G.magicEvent = null
            break // do nothing - allow us to track magic events 
    };

    return movetype;
};

function burnTable(G, ctx) {
    G.table = [];
    G.magicEvent = 'burning'
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



export default SHED;