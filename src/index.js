import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Redirect,
} from "react-router-dom";
import { DEBUGING_UI } from './config';
import './index.css';
import Homescreen from "./pages/homescreen";
import Lobby from "./pages/lobby";
import { GameRoom } from "./pages/gameroom";
import reportWebVitals from './reportWebVitals';


import { Client }  from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import  SHED  from './game/Game';
import  SHEDtable  from './game/Table';
const DebugSHEDClient = Client({
  game: SHED,
  board: SHEDtable,
  debug: true, //DEBUGING_UI,
  numPlayers: 2,
  multiplayer: Local(),
});




//do routing here - start in homepage -> 


const App = () => {
    const history = useHistory();   
      if (DEBUGING_UI) {
        localStorage.clear()
        return(
            <div>
                <DebugSHEDClient playerID="0"/>
                <DebugSHEDClient playerID="1"/>
                {/* <DebugSHEDClient playerID="2"/>
                <DebugSHEDClient playerID="3"/> */}
            </div>
        );  
      }
      return (
          <Switch>
            <Route exact path="/lobby">
              <Lobby history={history} />
            </Route>
            <Route exact path="/" >
              <Homescreen history={history} />
            </Route>
            <Route path="/shed/:matchID">
              <GameRoom history={history} />
            </Route>
            <Redirect to="/" />
          </Switch> 
      );
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App/>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


