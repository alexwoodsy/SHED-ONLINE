import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core';
import { DEBUGING_UI } from '../config';

//Debugging parameters
var cardsInHand = 3; //default 3
var emptyDeck = false; //false
var handOf = null; //default null
var endGame = false; //default false
var debugGameSettings = {cutIns: true, danMode: false, playOnafterWin: false}; //only used in debug mode

const constructCard = (suit, rank) => {
    const isMagic = () => {
        let magic = [2, 3, 10]; 
        if (debugGameSettings.danMode) {
          magic = [2, 3, 7, 10];
        }
        let magicCheck = false;
        for (let i=0; i < magic.length; i++) {
            if (magic[i] === rank) {
                magicCheck = true
            };
        }
        return magicCheck
    }
    
    return ({
        suit: suit,
        rank: rank,
        magic: isMagic(),
        invisible: (rank===3),
        name: `card_${rank.toString()}${suit}`,
        LastPlayedBy: null,
        turnPlayedOn: null,
        currentLocation: null,
        currentLocationIndex: null,
        lastLocation: null,
    })
}

const updateCardLocation = (card, newLocation) => {
    let curLoc = card.currentLocation
    card.currentLocation = newLocation
    card.LastLocation = curLoc;
}

function GetDeck() {
    let suits = ["hearts", "diamonds", "spades", "clubs"];
    let ranks = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let deck = []
    for (let i=0; i < suits.length; i++) {
        for (let j=0; j < ranks.length; j++) {
            let card = constructCard(suits[i], ranks[j]);
            updateCardLocation(card, 'deck')
            deck.push( card ) 
        }
    }
    return deck
}


export const SHED = {
    name: 'SHED',
    setup: (ctx, setupData) => ({ 
        settings: DEBUGING_UI ? debugGameSettings : setupData,
        startingOrder: Array(ctx.numPlayers),
        deck: GetDeck(),
        hands: Array(ctx.numPlayers).fill(Array(0)),
        benchs: Array(ctx.numPlayers).fill(Array(3).fill(Array(2))),
        table: Array(0),
        Ready: Array(ctx.numPlayers).fill(0),
        sevenHighLow: 'default', //can be: default - higher - lower
        lastPlayed: null,
        magicEvent: {"type": null, "count":0},
        hasTen: false,
        playingAgain: Array(ctx.numPlayers),
        newMatchID: null,
        winningOrder: [],
        hostClient: null,       
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
                if (emptyDeck===true) {G.deck = []};
                ctx.events.setActivePlayers({
                    all: 'settingBench'
                });

                if (endGame) {
                    ctx.events.endPhase()
                }
            },
            onEnd: (G, ctx) => {
                setStartingOrder(G, ctx); 
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
            next:'EndPhase',
            turn: { 
                order: {
                    first: (G, ctx) => Number(G.startingOrder[0]),
                    next: (G, ctx) => {
                        if (G.settings.playOnafterWin && ctx.numPlayers > 2) {
                            return nextPlayerNotFinished(G, ctx)
                        }
                        return (ctx.playOrderPos + 1) % ctx.numPlayers
                    },
                },


                onBegin: (G, ctx) => { 
                    if (G.hands[ctx.currentPlayer].length > 0) {
                        if ( CanPlay(G, ctx) ) {
                            ctx.events.setActivePlayers({currentPlayer: 'play'});
                        } else {
                            ctx.events.setActivePlayers({currentPlayer: 'pickup'});
                        };
                    } else {
                        if ( CanPlayBench(G, ctx) || BenchPlayable(G, ctx).layer ===0){
                            ctx.events.setActivePlayers({currentPlayer: 'playBench'});
                        } else if (G.deck.length === 0 && BenchPlayable(G, ctx).layer===1) {
                            ctx.events.setActivePlayers({currentPlayer: 'pickupBench'});
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
                    pickupBench: {
                        moveLimit: 1,
                        moves: {TakeBench},
                    },
                    play: {
                        moveLimit: 4,
                        moves: {PlayCard, EndPlay}, 
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

        EndPhase: {
            onBegin: (G, ctx) => {
                ctx.events.setActivePlayers({
                    all: 'playAgainChoice'
                });
            },
            turn: {
                stages: {
                    playAgainChoice: {
                        start: true,
                        moves: {
                            playAgain,
                            setnewMatchID,
                        },
                    },
                },
            },
        },
    },
};


function orderHand(G, ctx) {
    if (G.hands[ctx.currentPlayer].length > 1) {
        G.hands[ctx.currentPlayer] = G.hands[ctx.currentPlayer].sort(function (a, b) {
            return a.rank - b.rank;
        });
    }    
}

function playAgain(G, ctx, choice, player) {
    G.playingAgain[player] = choice
    //set host after all have chosen
    let numChosen=0
    G.playingAgain.forEach(element => {
        if (element !== null) {
            numChosen++
        }        
    });

    if (numChosen===ctx.numPlayers) {
        for (let i=0; i<ctx.numPlayers; i++) {
            if (G.playingAgain[i]) {
                G.hostClient = i.toString()
                break;   
            }  
        }
        //defualt to zero if everyone clicks leave - only player zero does this assignment
        if (player===0 && G.hostClient===null) { 
            G.hostClient='0'
        }
    }
}



function setnewMatchID(G, ctx, matchID) {
    G.newMatchID = matchID 
}

function nextPlayerNotFinished(G, ctx) {
    let player = ctx.currentPlayer
    let playerFinished = G.winningOrder.includes(player) 
    console.log("current player done", playerFinished)
    let remainingPlayers = ctx.playOrder.filter((element)=>{
        return !G.winningOrder.includes(element) || G.winningOrder.includes(player) 
    })

    let playerIndex = remainingPlayers.indexOf(player)
    

    for (let i=0; i< playerIndex; i++) {
        let front = remainingPlayers.shift()
        remainingPlayers.push(front)
    }

    

    console.log("remaining", remainingPlayers)
    console.log("current", player, "next calculated", Number(remainingPlayers[1]))
    return Number(remainingPlayers[1]);
}

function playerFinished(G, ctx) {
    console.log('finished')
    if (G.settings.playOnafterWin && ctx.numPlayers > 2) {
        G.winningOrder.push(ctx.currentPlayer)
        ctx.events.endTurn();
        console.log("before if",G.winningOrder.length)
        if (G.winningOrder.length === ctx.numPlayers-1) {
            //add remaining
            let remainingPlayer = ctx.playOrder.filter((element)=>{
                return !G.winningOrder.includes(element)
            })
            G.winningOrder = G.winningOrder.concat(remainingPlayer)
            ctx.events.endPhase()
        }

    } else {
        G.winningOrder.push(ctx.currentPlayer)
        ctx.events.endPhase()
    }
}

function LowestCardPlayer(G, ctx) { 
    let lowestRank=15; //init high
    let lowestPlayers = [];
    for (let id=0; id < ctx.numPlayers; id++){
        let hand = G.hands[id]
        for (let i=0; i<hand.length; i++) {
            let card = hand[i]
            if (card.rank === lowestRank) { lowestPlayers.push(id) }
            if (card.rank < lowestRank && !card.magic ) { lowestPlayers = [id]; lowestRank=card.rank }
        }
    }
    return {lowestRank, lowestPlayers}
}


function setStartingOrder(G, ctx) {
    let first = LowestCardPlayer(G, ctx).lowestPlayers[0]
    let playerOrder = [0, 1, 2, 3].slice(0, ctx.numPlayers);
    for (let i=0; i<first; i++) {
        let front = playerOrder.shift()
        playerOrder.push(front)
    };
    G.startingOrder = playerOrder.map(String)
}


                


function initBench (G, ctx) {
   for (let id=0; id < ctx.numPlayers; id++){
       for (let pos=0; pos < 3; pos++) {
        for (let order=0; order < 2; order++) {
            let card = G.deck.pop(); 
            updateCardLocation(card, 'bench')
            G.benchs[id][pos][order] = card;
        };
       }; 
   };
};

function initHand (G, ctx) {
    for (let id=0; id < ctx.numPlayers; id++){
        if (handOf !== null && id===0) { 
            for (let i=0; i<G.deck.length; i++) {
                if (G.deck[i].rank === handOf) {
                    let card = G.deck.splice(i, 1)[0]
                    updateCardLocation(card, 'hand')
                    G.hands[id].push( card )
                }
            }
        } else {
            for (let pos=0; pos < cardsInHand; pos++) {
                let card = G.deck.pop();
                updateCardLocation(card, 'hand')
                G.hands[id].push( card )
            };
        }
    };
};


function PickupTable(G, ctx) {
    let cards = G.table;
    if (cards.length > 0) {
        cards.forEach(card => {
            updateCardLocation(card, 'hand')
        });
        G.hands[ctx.currentPlayer] = G.hands[ctx.currentPlayer].concat(cards);
        G.table = [];
        G.lastPlayed = null; 
        ShouldMagicEventReset(G, ctx)
        orderHand(G, ctx)
        ctx.events.endTurn();
    } else {
        return INVALID_MOVE;
    }
};


function DrawCard(G, ctx) {
    if (G.deck.length > 0) {
        let card = G.deck.pop();
        updateCardLocation(card, 'hand')
        G.hands[ctx.currentPlayer].push( card  )  
        
        if (G.hands[ctx.currentPlayer].length >=3 || G.deck.length===0) {
            orderHand(G, ctx)
            ctx.events.endTurn()
        }
    } else {
        return INVALID_MOVE;
    }
    
    
}
  
  
function PlayCard(G, ctx, position) {  
    let card = G.hands[ctx.currentPlayer][position]
    //debugging end game instantly
    if ( MoveValid(G, ctx, card) ) {
        let card = G.hands[ctx.currentPlayer].splice(position, 1)[0]
        card.LastPlayedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        updateCardLocation(card, 'table')
        G.lastPlayed = card;
        ShouldMagicEventReset(G, ctx)
      
        //add to table
        G.table = G.table.concat( card )

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }
        
        //update whether the player has a ten in his hand for later checks
        G.hasTen = hasTen(G, ctx)

        
        //end of play behaviour
        if (CanPlayAgain(G, ctx) === false) {
            //update gamestate if card(s) played have magic behaviour
                MoveIsMagic(G, ctx)
                EndPlay(G, ctx); 
        }; 

        //Debuuging end game (say this player has finsihed if they play a 4)
        if (endGame && card.rank===4) { 
            playerFinished(G, ctx)
        }
       //handle playing last card in hand 
       if (G.hands[ctx.currentPlayer].length===0 && (BenchPlayable(G, ctx).layer===0 && BenchPlayable(G, ctx).positions.length ===0)) {
            playerFinished(G, ctx);
       } else if (G.hands[ctx.currentPlayer].length===0 && G.deck.length===0) {
            MoveIsMagic(G, ctx)
            if (G.magicEvent.type ==="Higher or lower") {
                console.log('should end play')
                EndPlay(G, ctx);
            } else {
                console.log("set playbench from playcard")
                ctx.events.setStage('playBench')
            }
       } else if (G.hands[ctx.currentPlayer].length===0 && G.lastPlayed.LastPlayedBy!==ctx.currentPlayer) {
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx);
       }
    } else {
        return INVALID_MOVE;
    };
  };

function TakeBench(G, ctx, player, position) {
    let benchPoslen = G.benchs[player][position].length
    if (benchPoslen !== 1) {
        let card = G.benchs[player][position].pop()
        updateCardLocation(card, 'hand')
        G.hands[player].push( card ) 
    } else {
        return INVALID_MOVE;
    };
    //end trun after pickup a card from bench
    if (ctx.activePlayers[player] === 'pickupBench') {
        ctx.events.setActivePlayers({currentPlayer: 'pickup'});
    }
};


function AddBench(G, ctx, player, position) {
    let freeBenchPos = null;
    //find free space on the bench to add the card
    for (let i=0; i<3; i++) {
        let benchPoslen = G.benchs[player][i].length
        if (benchPoslen < 2) {
            freeBenchPos = i
        };
    };
    
    if (freeBenchPos !== null ) {
        let card = G.hands[player].splice(position, 1)[0]
        updateCardLocation(card, 'bench')
        G.benchs[player][freeBenchPos].push( card )
    } else {
        return INVALID_MOVE;
    };
};

function PlayBench(G, ctx, position) {
    let PlayablePositions = BenchPlayable(G, ctx).positions;
    let StartLayer = BenchPlayable(G, ctx).layer;
    let section = G.benchs[ctx.currentPlayer][position];
    let card = section[section.length-1];
    
    //make sure they are not playing from bottom if top remains
    let correctLayer = false;
    for (let i=0; i<PlayablePositions.length; i++) {
        if (position===PlayablePositions[i]) {correctLayer = true}
    }

    if ( MoveValid(G, ctx, card) && correctLayer) {
        //play the card
        let card = G.benchs[ctx.currentPlayer][position].pop()
        updateCardLocation(card, 'table')
        card.LastPlayedBy = ctx.currentPlayer;
        card.turnPlayed = ctx.turn;
        G.lastPlayed = card;
        G.table.push( card ) 
        ShouldMagicEventReset(G, ctx)

        //burn instantly deck if card was a 10
        if ( canBurn(G, ctx) ) { burnTable(G, ctx) }

        //update whether the player has a ten in his hand for later checks
        G.hasTen = hasTen(G, ctx)

        if (BenchPlayable(G, ctx).layer===0 && BenchPlayable(G, ctx).positions.length ===0) {
            playerFinished(G, ctx);
        } else if (CanPlayAgainBench(G, ctx) === false) {
            MoveIsMagic(G, ctx)
            EndPlay(G, ctx); 
        }

    } else {
        if (StartLayer===1) {
            return INVALID_MOVE;
        } else if (StartLayer===0) {
            card.LastPlayedBy = ctx.currentPlayer;
            card.turnPlayed = ctx.turn;
            
            G.table.push( G.benchs[ctx.currentPlayer][position].pop() ) 
            //do not do magic in this case
            ctx.events.setStage('pickup')
        }
        
    };
}

//returns the positions and the layer from which bench cards can be played 
function BenchPlayable(G, ctx) { 
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
        }
    }; 
};

function SevenChoice(G, ctx, choice) {
    G.sevenHighLow = choice;
    if (G.deck.length === 0) {
        ctx.events.endTurn();
    } else if (G.hands[ctx.currentPlayer].length >=3 || G.deck.length===0) {
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
                break
            }
            i--
        };
        
        if ((G.lastPlayed.LastPlayedBy===ctx.currentPlayer)  ) {
            if (G.lastPlayed.rank !== card.rank) {checkval = false}
        } else if (card.magic === false) {
            if (topCard.invisible) {
                if (lastNormCard!==null) { 
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
            } else if (topCard.rank > card.rank) {
                checkval = false; 
            };       
        };
    
        
    };
    //valid unless a check above says otherwise
    return checkval;
};


//retrun true if player has card in hand with rank = to the one they just played 
function CanPlayAgain(G, ctx) { 
    let cards=G.hands[ctx.currentPlayer]
    let chekval = false;

    if (G.lastPlayed === null || (G.magicEvent.type==='burning' )) {
        chekval = true;
    } else {
        for (let i=0; i < cards.length; i++) {
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
    } else { 
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

function MoveIsMagic(G, ctx) {
    let movetype = null //default
    let table=G.table
    if (table.length !==0) {
        let topCard = table[table.length-1]
        movetype = topCard.rank

        if (canBurn(G, ctx)===true ) { movetype ='burn'}

        switch(movetype) {
            case 10:
            case 'burn':
                burnTable(G, ctx)
                break;
            case 7:
                G.magicEvent.type = 'Higher or lower'
                G.magicEvent.count++
                break;
            case 3:
                G.magicEvent.type = 'Invisible'
                G.magicEvent.count++
                break;
            case 2:
                G.magicEvent.type = 'reset'
                G.magicEvent.count++
                break
            default: 
                G.magicEvent.type = null
                G.magicEvent.count = 0
                break 
        };
    };
};

function burnTable(G, ctx) {
    G.table = [];
    G.magicEvent.type = 'burning'
    G.magicEvent.count++
}

//check if there are 4 of the same played - burn if so 
function canBurn(G, ctx) {
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

function hasTen (G, ctx) { 
    let stage = ctx.activePlayers[ctx.currentPlayer]

    if (stage === 'play') {
        let cards=G.hands[ctx.currentPlayer]
            for (let i=0; i < cards.length; i++) {
                let card = cards[i];
                if ( card.rank===10 ) {
                    return true}
            }
    } else if (stage === 'playBench'){
        if (BenchPlayable(G, ctx).layer===1 && G.lastPlayed.LastLocation === 'bench') {
            let postions = BenchPlayable(G, ctx).positions;
            for (let i=0; i<postions.length; i++) {
                let card = G.benchs[ctx.currentPlayer][postions[i]][1];
                if ( card.rank===10 ) {
                    return true}
            };
        };    
    };
    return false;
}

function ShouldMagicEventReset (G, ctx) {
    if (G.lastPlayed === null) {
        G.magicEvent = {type: null, count:0}
        G.sevenHighLow = 'default'
    } else if (G.lastPlayed.rank!==3) {
        G.magicEvent = {type: null, count:0}
        G.sevenHighLow = 'default'
    } else if (G.lastPlayed.rank===3 && G.magicEvent.type==="burning") {
        G.magicEvent = {type: null, count:0}
        G.sevenHighLow = 'default'
    }
}

export default SHED;