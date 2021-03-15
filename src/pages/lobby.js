import React, { useState, useEffect, useMemo } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { DEFAULT_PORT, APP_PRODUCTION } from "../config";
import Slider from '@material-ui/core/Slider';
import "./Style.css"

const { origin, protocol, hostname } = window.location;
const SERVER = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;


function saveClientData(playerID, MatchID, numberOfPlayers, playerName, playerCredentials, lobbyClient) {
    console.log("saving number of players", numberOfPlayers)
    localStorage.setItem("playerID", playerID);
    localStorage.setItem("MatchID", MatchID);
    localStorage.setItem("numberOfPlayers", numberOfPlayers);
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("playerCredentials", playerCredentials);
    //ONCE JOINED CLEAR NEWMATCH/prevplatername LOCAL STORAGE
    localStorage.removeItem("newMatchID")
    localStorage.removeItem("previousPlayerName")
}


export const Lobby = (props) => {
    //const [canJoin, setcanJoin] = useState(false);
    const [matchID, setmatchID] = useState('')
    const [playerName, setplayerName] = useState('')
    const [numberOfPlayers, setnumberOfPlayers] = useState(2)
    //const [playerCredentials, setplayerCredentials] = useState(null)
    const [joining, setjoining] = useState(false)
    //const connectingClient = useRef(false);
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency means init once
    
    useEffect(()=>{
        
        const ConnectClient = async () => {
            let freeSeat = null;
            let numPlayersMatchJoining = null;
            console.log("getting free seat")
            try {
                const matchJoining = await lobbyClient.getMatch('SHED', matchID)
                console.log("joining num of players", matchJoining.players.length)
                numPlayersMatchJoining = matchJoining.players.length
                for (let i=0; i < matchJoining.players.length; i++) {
                    if (typeof matchJoining.players[i].name === 'undefined') {
                        freeSeat = i.toString()
                        break;
                    }
                }
            } 
            catch(err) {
               console.log(matchID, err)
                alert('could not find match')
            }

            console.log("free seat", freeSeat)

            if (freeSeat === null) {
                alert('no room in game / no game found');
            } else {
                console.log("now joining")
                const { playerCredentials } = await lobbyClient.joinMatch(
                    'SHED',
                    matchID,
                    {
                        playerID: freeSeat,
                        playerName: playerName,
                    },
                );
    
                console.log("now saving info")
                saveClientData(
                    freeSeat,
                    matchID, 
                    numPlayersMatchJoining, 
                    playerName, 
                    playerCredentials,
                    lobbyClient
                )
                console.log(await lobbyClient.listMatches("SHED"))
                props.history.push("/shed/"+matchID) 
            }
        };

        if (joining) {
            ConnectClient()  
        };
        
    }, [joining, playerName, lobbyClient, matchID, props.history])

    //on mount check if the player has a newmatch
    useEffect(()=>{
        let newMatchID = localStorage.getItem("newMatchID")
        let previousPlayerName = localStorage.getItem("previousPlayerName")
        
        if (newMatchID !== undefined && newMatchID !== null && newMatchID !== "INSUFF_PLAYERS" && previousPlayerName!==undefined) {
            setmatchID(newMatchID)
            setplayerName(previousPlayerName)
            Join()
        }
    }, [])


    const Join = () => {
        setjoining(true)
    };

    const Create  = async () => {
        //console.log(numberOfPlayers)
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
        event.preventDefault()
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
        <div id={props.isMobile? "mobileLobby": "lobby"}>
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
        <div>
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
                        <input className="bigButton" type="submit" value="Join" onSubmit={props.onSubmit} />
                    </label>
                </div>
            </form>
        </div>
        
    );
}

const CreateMatch = (props) => {
    return(
    <div>
        <h2>Create Match</h2>
        <label>
            Number of Players:
            <Slider id="slider"
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
        
        <button className="bigButton" onClick={props.onChangeCreateMatch}>
            Create match
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