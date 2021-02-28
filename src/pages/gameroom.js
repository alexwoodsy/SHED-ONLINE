import React, { useMemo, useState, useEffect } from 'react'
import { Client }  from 'boardgame.io/react';
import { SocketIO, Local } from 'boardgame.io/multiplayer';
import  SHED  from '../game/Game';
import  SHEDtable  from '../game/Table';
import { DEFAULT_PORT, APP_PRODUCTION, DEBUGING_UI } from "../config";
import { LobbyClient } from 'boardgame.io/client';

const { origin, protocol, hostname } = window.location;
const SERVER = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

const SHEDClient = Client({
    game: SHED,
    board: SHEDtable,
    debug: false, 
    multiplayer: SocketIO({server: SERVER}),
    loading: loading,
  });


const DebugSHEDClient = Client({
    game: SHED,
    board: SHEDtable,
    debug: true, //DEBUGING_UI,
    numPlayers: 2,
    multiplayer: Local(),
    loading: loading,
  });

  
function loading () { 
    const element = (<h1> put loading screen here</h1>)
    return element;
    
  }

export const GameRoom = (props) => {
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency means init once
    const playerID = localStorage.getItem("playerID");
    const matchID = localStorage.getItem("MatchID");
    const numberOfPlayers = localStorage.getItem("numberOfPlayers");
    //const playerName = localStorage.getItem("playerName");
    const playerCredentials = localStorage.getItem("playerCredentials");
    
    const [playersJoined, setplayersJoined] = useState([])

    //ping the server for number of players 
    useEffect(() => {
        const PlayersInRoom = async () => {
            let players = [];
            const matchInstance = await lobbyClient.getMatch('SHED', matchID)
            matchInstance.players.forEach(element => {
                if (element.name !== undefined) {
                    players.push( element.name )
                }
            });
            return players;
        }

        const timeout = setTimeout(() => PlayersInRoom().then( value => {
            setplayersJoined(value)
          }  
        ), 1000)
    
        return () => {
          clearTimeout(timeout);
        };
      }, [playersJoined, lobbyClient, matchID])

    if (DEBUGING_UI) {
        return(
            <div>
                <DebugSHEDClient playerID="0"/>
                <DebugSHEDClient playerID="1"/>
                {/* <DebugSHEDClient playerID="2"/>
                <DebugSHEDClient playerID="3"/> */}
            </div>
        );
        
    } else {
        if (playersJoined.length === parseInt(numberOfPlayers) ) {
            return (
                <SHEDClient 
                playerID={playerID} 
                matchID={matchID} 
                credentials={playerCredentials} />
            );
        } else {
            return (
                <div>
                    <h1>waiting room</h1>
                    <h2> players in room({playersJoined.length}/{numberOfPlayers}):</h2>
                    <div>
                        {playersJoined.map((name, index) => (
                            <p key={index}>{index+1}. {name}</p>
                        ))}
                    </div>
                </div> 
            )
        }
    }
    
}
