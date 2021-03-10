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






//do routing here - start in homepage -> 


const App = () => {
    const history = useHistory();   
      if (DEBUGING_UI) {
        return (
          <GameRoom />
        )
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


