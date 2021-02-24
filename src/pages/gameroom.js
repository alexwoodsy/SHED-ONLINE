import React from 'react'
import { Client }  from 'boardgame.io/react';
import { SocketIO, Local } from 'boardgame.io/multiplayer';
import  SHED  from '../game/Game';
import  SHEDtable  from '../game/Table';
import { DEFAULT_PORT, APP_PRODUCTION, DEBUGING_UI } from "../config";

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
        const playerID = localStorage.getItem("playerID");
        const matchID = localStorage.getItem("MatchID");
        //const numberOfPlayers = localStorage.getItem("numberOfPlayers");
        //const playerName = localStorage.getItem("playerName");
        const playerCredentials = localStorage.getItem("playerCredentials");

        return (
            <SHEDClient 
            playerID={playerID} 
            matchID={matchID} 
            credentials={playerCredentials} />
        );
     }
    
    
}

/*

 */