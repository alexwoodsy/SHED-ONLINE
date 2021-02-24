import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { DEFAULT_PORT, APP_PRODUCTION } from "../config";
import Slider from '@material-ui/core/Slider';
import "./Style.css"

const { origin, protocol, hostname } = window.location;
const SERVER = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;








function saveClientData(playerID, MatchID, numberOfPlayers, playerName, playerCredentials) {
    localStorage.setItem("playerID", playerID);
    localStorage.setItem("MatchID", MatchID);
    localStorage.setItem("numberOfPlayers", numberOfPlayers);
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("playerCredentials", playerCredentials);
}


export const Lobby = (props) => {
    //const [canJoin, setcanJoin] = useState(false);
    const [playerID, setplayerID] = useState(null);
    const [matchID, setmatchID] = useState('')
    const [playerName, setplayerName] = useState('')
    const [numberOfPlayers, setnumberOfPlayers] = useState(2)
    //const [playerCredentials, setplayerCredentials] = useState(null)
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
                    //setcanJoin(true);
                    //setplayerCredentials(playerCredentials); 
                    saveClientData(
                        playerID,
                        matchID, 
                        numberOfPlayers, 
                        playerName, 
                        playerCredentials
                    )
                    props.history.push("/shed/"+matchID)

                                                   
            } else {
                alert('no room in game / no game found');
            }
        };
        if (connectingClient.current) {
            ConnectClient(playerName)
            connectingClient.current = false;
        };
        
    }, [playerID, playerName, lobbyClient, matchID, numberOfPlayers, props.history])

    
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

    const Create  = async () => {
        console.log(numberOfPlayers)
        try {
            const { matchID } = await lobbyClient.createMatch('SHED', {
                numPlayers: numberOfPlayers
                });
            setmatchID(matchID)
        } catch(err) {
            alert('could no create match - check connection')
            console.error(err)
        }
        
    };

    function handleChangeJoinMatch (event) {
        setmatchID(event.target.value)
    };

    function handleChangePlayerName (event) {
        setplayerName(event.target.value)
    };

    function handleChangeNumberOfPlayers (event, value) {
        setnumberOfPlayers(value)
    }

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
        //create the game and assign match ID to state:
        Create()
        //event.preventDefault();
    }

    return (
        <div className="lobby">
            <CreateMatch
                onChangeCreateMatch={handleCreateMatch}
                onChangeNumberOfPlayers={handleChangeNumberOfPlayers}
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
        <label>
            Number of Players:
            <Slider 
                defaultValue={2}
                onChange={props.onChangeNumberOfPlayers}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={2}
                max={4}
            />
        </label>
        
        <button onClick={props.onChangeCreateMatch}>
            <h2>Create match</h2>
        </button>
    </div>
    );
}

export default Lobby


/* 
join should history.push("/shed/"+matchID) entering waiting room -> this will then render client
once all players have joined -> will read player creds from local stroage and pass to client 

to test simply route to game room and join automatically - add waiting in later

*/