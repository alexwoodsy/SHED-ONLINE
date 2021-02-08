import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './index.css';
import {  Homescreen, Lobby } from "./pages";
import reportWebVitals from './reportWebVitals';




//do routing here - start in homepage -> 


class App extends React.Component {
    render() {
      
      return <h1>checking router not the issue</h1>

      // return (
      //   <Router>
      //       <Switch>
      //         <Route path="/lobby">
      //           <Lobby />
      //         </Route>
      //         <Route path="/">
      //           <Homescreen />
      //         </Route>
      //       </Switch>
      //   </Router>
      // );
  } 
}

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


