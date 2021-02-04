import React from 'react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer'
import { SHED, SHEDtable } from '../game';


// const { origin, protocol, hostname } = window.location;
// const port = 8000;
// const SERVER = `${protocol}//${hostname}:${port}`;
const SERVER = 'localhost:8000'


export const SHEDClient = Client({
    game: SHED,
    board: SHEDtable,
    debug: true,
    multiplayer: SocketIO({server: SERVER}),
    loading: loading,
  });

function loading () { 
  const element = (<h1> put loading screen here</h1>)
  return element;
  
}

export class Lobby extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            canJoin: false,
            playerID: null, 
            matchID: '', 
            playerName: '',
            playerCredentials: null,

        };
        this.lobbyClient = null;
    }


    handleChangeJoinMatch = (event) => {
        this.setState({matchID: event.target.value})
    };

    handleChangePlayerName = (event) => {
        this.setState({playerName: event.target.value})
    };

    async handleJoin (event) {
        event.preventDefault()
        console.log(this.getMatchJoining())
        const { playerCredentials } = await this.lobbyClient.joinMatch(
            'SHED',
            this.state.matchID,
            {
              playerID: this.state.playerID,
              playerName: this.state.playerName,
            }
          );
        this.setState({playerCredentials: playerCredentials})
    };

    //need to use game/matchID to create lobby in
    async handleCreateMatch (numPlayers) {
        
        console.log(SERVER)
        this.lobbyClient  = new LobbyClient(SERVER);

        //create the game and assign match ID to state:
        const { matchID } = await this.lobbyClient.createMatch('SHED', {
            numPlayers: numPlayers
          });

        this.setState({matchID: matchID}) //autofills
        
    }

    //gets info on game currently joining so we can assign this client an ID
    async getMatchJoining() {
        const match = await this.lobbyClient.getMatch('SHED', this.state.matchID);
        const playersInMatch = match.players;

    }
    
    
    createMatch = () => {
        //change to be a selection thing 0-4 for the number of players
        let numPlayers = 2;
        if (this.state.playerID === null) {
            return (
                <div>
                    <h2>Create Match</h2>
                    <button onClick={() => this.handleCreateMatch(numPlayers)}>
                        <h2>Create match</h2>
                </button>
                </div>

            );
        }
        return null;
    }
    
    joinMatch = () => {
        if (this.state.canJoin === false) {
            return(
                <form onSubmit={this.handleJoin}>
                    <h2>Join Match</h2>
                    <div>
                    <label>
                        Player Name:
                        <input type="text" value={this.state.playerName} onChange={this.handleChangePlayerName} />
                    </label>
                    </div>
                    <div>
                    <label>
                        match ID:
                        <input type="text" value={this.state.matchID} onChange={this.handleChangeJoinMatch} />
                        <input type="submit" value="Join" />
                    </label>
                    </div>
                </form>
            );
        }
        return (
            <SHEDClient playerID={this.state.playerID} matchID={this.state.matchID} />
        )
    }

    render () {
        return(
            <div>
                {/* <this.renderPlayerChoice /> */}
                <this.createMatch />
                <this.joinMatch />
            </div>  
        ); 
    }
}



//legacy
// renderPlayerChoice = () => {
       
//     if (this.state.playerID === null) {
//         return (
//             <div>
//             <h1>Lobby</h1>    
//             <p>Play as</p>
//             <button onClick={() => this.setState({ playerID: "0"})}>
//                 Player 0
//             </button>
//             <button onClick={() => this.setState({ playerID: "1"})}>
//                 Player 1
//             </button>
//             </div>
//         );
//     }
//     return (
//         <div>
//             <SHEDClient playerID={this.state.playerID} />
//         </div>
//     );
// }