import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Client }  from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import  SHED  from '../game/Game';
import  SHEDtable  from '../game/Table';
import Menu from '../game/Menu'
import { DEFAULT_PORT, APP_PRODUCTION } from "../config";
import { LobbyClient } from 'boardgame.io/client';
import "./Style.css"

const { origin, protocol, hostname } = window.location;
const SERVER = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export const Pending = (props) => { 
    return (
        <div className="center" style={{
            "background": "rgba(1,1,1,0.2)"
        }}>
            <div className="center" style={{
                "top": "65%",
                "fontSize": 50,
                "color": "rgba(255,255,255)",
                
            }}>
                {props.text}
            </div>
            <div className="lds-dual-ring" />
        </div>
    )
  }
  const loading = () => <Pending text={"loading"}/>

const SHEDClient = Client({
    game: SHED,
    board: SHEDtable,
    debug: false, 
    multiplayer: SocketIO({server: SERVER}), 
    loading: loading
  });

export const GameRoom = (props) => {
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency  (init once)
    const playerID = localStorage.getItem("playerID");
    const matchID = localStorage.getItem("MatchID");
    const numberOfPlayers = localStorage.getItem("numberOfPlayers");
    const playerName = localStorage.getItem("playerName");
    const playerCredentials = localStorage.getItem("playerCredentials");
    const [playersJoined, setplayersJoined] = useState([])
    const [numPlayingAgain, setnumPlayingAgain] = useState(null)
    const [joinDelay, setjoinDelay] = useState(null)

    const isInitialMount = useRef(true);
     
    //ping the server for number of players 
    useEffect(() => {
        let isSubscribed = true;
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
          if (playersJoined.length !== parseInt(numberOfPlayers) && isSubscribed ) {  
            setplayersJoined(value)
            }
          }  
        ), 1000)
    
        return () => {
          clearTimeout(timeout);
          isSubscribed=false;
          
        };
      }, [playersJoined, numberOfPlayers, lobbyClient, matchID ])

    const hasCreated=useRef(false)
    useEffect(()=>{
        const getNumPlayingAgain = (event) => {
            let count = 0
            for (let i=0; i<event.detail.players.length; i++) {
                if (event.detail.players[i]) {count++}
            }
            setnumPlayingAgain(count)
        }

        if (hasCreated.current===false) {
            document.addEventListener("PlayAgain", (event)=>getNumPlayingAgain(event), { once: true })
            hasCreated.current = true;
        }  
        return () => {
            document.removeEventListener("PlayAgain", (event)=>getNumPlayingAgain(event) )
        }

    })

    
    useEffect(()=>{
        let isSubscribed = true;
        const CreateNewMatch  = async () => {
            try {
                const { matchID } = await lobbyClient.createMatch('SHED', {
                    numPlayers: numPlayingAgain
                    });
                return matchID;
            } catch(err) {
                alert('could no create match - check connection')
                console.error(err)
                return null
            }
            
        };

        const getnewMatchID = async () => {
            let newMatchID = await CreateNewMatch()  
            localStorage.setItem("newMatchID", newMatchID)
            document.dispatchEvent(new CustomEvent("newMatchCreated"))    
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (numPlayingAgain<2) {
                localStorage.setItem("newMatchID","INSUFF_PLAYERS")
                document.dispatchEvent(new CustomEvent("newMatchCreated"))    
            } else if (isSubscribed) {
                getnewMatchID()
            }
        }

        return () => (
            isSubscribed = false
        )
    }, [numPlayingAgain, lobbyClient])

    
    useEffect(()=>{
        const redirectLobby = () => {
            props.history.push("/lobby")
        }
        
        const conectToNewMatch = (event) => {
            localStorage.setItem("newMatchID", event.detail.matchID )
            localStorage.setItem("previousPlayerName", playerName)
            //trigger timer to delay join
            setjoinDelay((2+parseInt(playerID))*1000)
        }

        if (localStorage.getItem("newMatchID")!== undefined) {
            document.addEventListener("ReturnLobby", redirectLobby, {once: true})
            document.addEventListener("JoinNewMatch", (event)=>conectToNewMatch(event), {once: true})

        }
    
        return () => {
            document.removeEventListener("ReturnLobby", redirectLobby)
            document.removeEventListener("JoinNewMatch", (event)=>conectToNewMatch(event))
            
        }
    })

    useEffect(()=>{
        const timer = setTimeout(() => {
            if (isInitialMount.current===false && joinDelay!==null) {
                if (joinDelay > 0) {
                    setjoinDelay(joinDelay-1000)
                    console.log("time left to join",joinDelay)
                } else {
                    console.log('connecting to', localStorage.getItem("newMatchID"))
                    props.history.push("/lobby")
                }
            }
        }, 1000)

        return () =>{
            clearTimeout(timer)
        }

    },[joinDelay, props.history])

    const DelayTimer = () => {
        if (joinDelay !== null) {
            return (
                <Pending text={`Joining in ${joinDelay/1000}...`}/>
            )
        } else {
            return null;
        }
    }

    if (playersJoined.length === parseInt(numberOfPlayers) ) {
        return (
            <div>
                <SHEDClient 
                    playerID={playerID} 
                    matchID={matchID} 
                    credentials={playerCredentials}
                    isMobile={props.isMobile}
                /> 
                <DelayTimer/>
            </div>              
        ); 
    } else {
        return (
            <div>
                <Menu matchID={matchID} isMobile={props.isMobile}/>
                <div id={props.isMobile? "mobileLobby": "lobby"}>
                    <h1>waiting room</h1>
                    <h2> players in room({playersJoined.length}/{numberOfPlayers}):</h2>
                    <div>
                        {playersJoined.map((name, index) => (
                            <p key={index}>{index+1}. {name}</p>
                        ))}
                    </div>
                </div> 
            </div>
        )
    }   
}
