import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    //clear once joined
    localStorage.removeItem("newMatchID")
    localStorage.removeItem("previousPlayerName")
}


export const Lobby = (props) => {
    const [matchID, setmatchID] = useState('')
    const [playerName, setplayerName] = useState('')
    const [numberOfPlayers, setnumberOfPlayers] = useState(2)
    const [joining, setjoining] = useState(false)
    const showCreateMatch = useRef(true)
    const [showShareOptions, setshowShareOptions] = useState(false)
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency means init once
    
    useEffect(()=>{
        const ConnectClient = async () => {
            let freeSeat = null;
            let numPlayersMatchJoining = null;
            try {
                const matchJoining = await lobbyClient.getMatch('SHED', matchID)
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
            if (freeSeat === null) {
                alert('no room in game / no game found');
            } else {
                const { playerCredentials } = await lobbyClient.joinMatch(
                    'SHED',
                    matchID,
                    {
                        playerID: freeSeat,
                        playerName: playerName,
                    },
                );
                saveClientData(
                    freeSeat,
                    matchID, 
                    numPlayersMatchJoining, 
                    playerName, 
                    playerCredentials,
                    lobbyClient
                )
                props.history.push("/shed/"+matchID) 
            }
        };

        if (joining) {
            ConnectClient()  
        };
        
    }, [joining, playerName, lobbyClient, matchID, props.history])

    //on mount check if the player has a newmatch or has joined via a redirect
    useEffect(()=>{
        let newMatchID = localStorage.getItem("newMatchID")
        let linkMatchID = localStorage.getItem("joinByLinkMatchID")
        let previousPlayerName = localStorage.getItem("previousPlayerName")
        
        if (newMatchID !== undefined && newMatchID !== null && newMatchID !== "INSUFF_PLAYERS" && previousPlayerName!==undefined) {
            setmatchID(newMatchID)
            setplayerName(previousPlayerName)
            Join()
        } else if ( linkMatchID!== undefined && linkMatchID !== null) {
            setmatchID(linkMatchID)
            showCreateMatch.current = false
            localStorage.removeItem("joinByLinkMatchID")
        }
    }, [])


    const Join = () => {
        setjoining(true)
    };

    const Create  = async () => {
        try {
            const { matchID } = await lobbyClient.createMatch('SHED', {
                numPlayers: numberOfPlayers,
                setupData: {cutIns: true, danMode: false, playOnafterWin: false}
                });
            setmatchID(matchID)
            setshowShareOptions(true)
        } catch(err) {
            alert('could not create match - check connection')
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
        if (playerName.length > 20) {
            alert('Name is too long! (must be <20 chars')
        } else if (playerName.length!==0) {
            if (matchID.length === 11) {
                Join(); 
            event.preventDefault();
            } else {
                alert('match ID incorrect')
            }
        } else {
            alert('must enter a name before joining!')
        }
        
    };

    function handleCreateMatch (event) {
        Create()
    }

    return (
        <div id={props.isMobile? "mobileLobby": "lobby"}>
            {showCreateMatch.current && <CreateMatch
                onChangeCreateMatch={handleCreateMatch}
                onChangeNumberOfPlayers={handleChangeNumberOfPlayers}
            />}
            <JoinMatch
                playerName={playerName} 
                onChangePlayerName={handleChangePlayerName}
                matchID={matchID}
                onChangeMatchID={handleChangeJoinMatch}
                onSubmit={handleJoin} 
                showShareOptions={showShareOptions}
            />
        </div>
    );
};

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
                        <div className="inlineSubmit" >
                            <input type="text" value={props.matchID} onChange={props.onChangeMatchID} />
                            <input id="inputButton" type="submit" value="" onSubmit={props.onSubmit} />
                        </div> 
                    </label>
                </div>
                { (props.showShareOptions && props.matchID.length===11) && (
                    <div className="inlineSubmit">
                        share link to match
                        <input 
                            type="text" 
                            onChange={()=>null}
                            onFocus={(event)=>{event.target.select()}} 
                            value={`${origin}/matchLinkRedirect/${props.matchID}`}
                        />
                    </div>
                )}
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
