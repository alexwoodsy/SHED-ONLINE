import React from 'react';
import { Lobby } from "./lobby";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";


export class Homescreen extends React.Component {
    state = { playing: false }

    renderTitle = (props) => {
        if (this.state.playing === false) {
            return(
                <div>
                    <h1>{props.title}</h1>
                    <Link to="/lobby">
                        <button onClick={() => this.setState({ playing: true})}>
                            Play
                        </button>
                    </Link>
                </div>
            )
        }
        return null;
    }

    
    render () {
        return(             
            <Router>
                <this.renderTitle title={'Homescreen title'}/>
                <Switch>
                    <Route path="/lobby">
                        <Lobby/>
                    </Route>
                </Switch>
            </Router>
        );  
    }
}


export default Homescreen;