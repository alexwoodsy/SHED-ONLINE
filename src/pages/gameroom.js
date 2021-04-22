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
        <div className="center">
            <div className="lds-dual-ring" />
            <div className="center" style={{
                "top": "65%",
                "fontSize": 50,
                "color": "rgba(255,255,255)"
            }}>
                {props.text}
            </div>
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
    let lobbyClient = useMemo(()=> new LobbyClient({ server: SERVER }), [])//empty dependency means init once
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
        const PlayersInRoom = async () => {
            let players = [];
            const matchInstance = await lobbyClient.getMatch('SHED', matchID)
            console.log('checking number of players joined is ...',matchInstance.players.length)
            matchInstance.players.forEach(element => {
                if (element.name !== undefined) {
                    players.push( element.name )
                }
            });
            return players;
        }

        const timeout = setTimeout(() => PlayersInRoom().then( value => {
          if (playersJoined.length !== parseInt(numberOfPlayers) ) {
              setplayersJoined(value)
            }
          }  
        ), 1000)
    
        return () => {
          clearTimeout(timeout);
          
        };
      }, [playersJoined, numberOfPlayers, lobbyClient, matchID ])

    const hasCreated=useRef(false)
    useEffect(()=>{
        const getNumPlayingAgain = (event) => {
            //console.log('getting num playing again')
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
            //console.log("setting local stroage")    
            localStorage.setItem("newMatchID", newMatchID)
            //console.log('new match ID - triggereing event to update G')
            document.dispatchEvent(new CustomEvent("newMatchCreated"))    
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            //console.log('num playing agin', numPlayingAgain)
            if (numPlayingAgain<2) {
                //console.log("setting local stroage - not enough players") 
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
        const redirectLobby = async () => {
            console.log('redirecting to lobby')
            props.history.push("/lobby")
        }
        

        const conectToNewMatch = (event) => {
            localStorage.setItem("newMatchID", event.detail.matchID )
            localStorage.setItem("previousPlayerName", playerName)
            //NEED NUM OF PLAYERS TO BE SET
            //localStorage.setItem("numberOfPlayers",);


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
            //need another else if match ID is null

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
//buttons for playing again or return to lobby:
//- "return to lobby" calls leavematch and reidrcts to lobby
//- play again call's play again handler


