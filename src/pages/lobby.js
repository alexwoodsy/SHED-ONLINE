import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer'
import { SHED } from '../game/Game';
import { SHEDtable } from '../game/Table'


// import {
//     BrowserRouter as Router,
//     Switch,
//     Route,
//     Redirect,
//   } from "react-router-dom";



//const PORT = process.env.PORT || 8000; was in use on local depoloy
//const { protocol, hostname, port} = window.location;
//const SERVER = `${protocol}//${hostname}:${port}`;
//const importedGames = [{ game: SHED, board: SHEDtable }];


//directly from docs
const { origin, protocol, hostname } = window.location;
const SERVER = `${protocol}//${hostname}:${origin}`;



const SHEDClient = Client({
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

export const Lobby = () => {
    
    const [canJoin, setcanJoin] = useState(false);
    const [playerID, setplayerID] = useState(null);
    const [matchID, setmatchID] = useState('')
    const [playerName, setplayerName] = useState('')
    const [playerCredentials, setplayerCredentials] = useState(null)
    //const gettingSeat = useRef(false);
    const connectingClient = useRef(false);
       
    
    
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency means init once

    useEffect(()=>{
        const ConnectClient = async () => {
            if (playerID !== null) {
                const { playerCredentials } = await lobbyClient.joinMatch(
                        'SHED',
                        matchID,
                        {
                            playerID: playerID,
                            playerName: playerName,
                        },
                    );
                    setcanJoin(true);
                    setplayerCredentials(playerCredentials); 
                                
            } else {
                alert('no room in game/ no game found');
            }
        };
        if (connectingClient.current) {
            ConnectClient(playerName)
            connectingClient.current = false;
        };
        
    }, [playerID, playerName, lobbyClient, matchID])

    
    const getFreeSeat = async () => {
        //check if joining is possible 
       // console.log('joining match id', matchID)
       try {
        const matchJoining = await lobbyClient.getMatch('SHED', matchID)
        //console.log("joining", matchJoining)
        let freeSeat = null;
        for (let i=0; i < matchJoining.players.length; i++) {
            //console.log('checking players', matchJoining.players[i].name)
            if (typeof matchJoining.players[i].name === 'undefined') {
                freeSeat = i.toString()
                break;
            }
        }
        setplayerID(freeSeat)
       } catch(err) {
           console.log(matchID, err)
        alert('could not find match')
       }
    }

    
    const Join = async () => {
        getFreeSeat()
        connectingClient.current = true;
        
    };

    const Create  = async (numPlayers) => {
        try {
            const { matchID } = await lobbyClient.createMatch('SHED', {
                numPlayers: numPlayers
                });
            setmatchID(matchID)
        } catch(err) {
            alert('could no create match - check connection')
        }
        
    };

    function handleChangeJoinMatch (event) {
        setmatchID(event.target.value)
    };

    function handleChangePlayerName (event) {
        setplayerName(event.target.value)
    };

    function handleJoin (event) {
        if (playerName.length!==0) {
            if (matchID.length === 9) {
                Join(); 
            event.preventDefault();
            } else {
                alert('match ID incorrect')
            }
        } else {
            alert('must enter a name before joining!')
        }
        event.preventDefault();
    };

    function handleCreateMatch (event) {
        let numPlayers = 2;
        //create the game and assign match ID to state:
        Create(numPlayers)
        //event.preventDefault();
    }

    if (canJoin) {
        return (
            <SHEDClient 
            playerID={playerID} 
            matchID={matchID} 
            credentials={playerCredentials} />
        );
    } else {
        return (
            <div>
                <CreateMatch
                onChangeCreateMatch={handleCreateMatch}
                />
                <JoinMatch
                playerName={playerName} 
                onChangePlayerName={handleChangePlayerName}
                matchID={matchID}
                onChangeMatchID={handleChangeJoinMatch}
                onSubmit={handleJoin} 
                />
            </div>
        );
    }

};

//REMOVED SUBMUIT FROM FORM TAG - MAY NEED TO GO BACK IN
const JoinMatch = (props) => {
    return(
        <form onSubmit={props.onSubmit}>
            <h2>Join Match</h2>
            <div>
                <label>
                    Player Name:
                    <input type="text" value={props.playerName} onChange={props.onChangePlayerName} /> 
                </label>
            </div>
            <div>
                <label>
                    match ID:
                    <input type="text" value={props.matchID} onChange={props.onChangeMatchID} />
                    <input type="submit" value="Join" onSubmit={props.onSubmit} />
                </label>
            </div>
    </form>
);
}

const CreateMatch = (props) => {
    return(
    <div>
        <h2>Create Match</h2>
        <button onClick={props.onChangeCreateMatch}>
            <h2>Create match</h2>
        </button>
    </div>
    );
}


