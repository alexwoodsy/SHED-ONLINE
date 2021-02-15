

function Instructions(G, ctx, player) {
    let stage = ctx.activePlayers[player];
    let currentPlayer = ctx.currentPlayer
    let phase = ctx.phase;

    if (phase==='StartPhase') { //give payers all same instructions in the start phase
        return "set up your bench"
    } else if (phase==='MainPhase') {
        if (player.toString()===currentPlayer) { // instructions for player making turn
            let message = "Your turn: "
            return message.concat(stage)
        } else { //instructions for everyone else

            return 'waiting for turn'
        }  
    }

}





// function renderMagic() {

// }

export default Instructions