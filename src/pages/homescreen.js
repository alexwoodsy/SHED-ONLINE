import React from 'react';
import { Lobby } from "./lobby";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import "./Style.css"
import ShedLogo from '../images/Logo.png'
import wood from '../images/UI/wood.png'


export class Homescreen extends React.Component {
    state = { playing: false }

    renderTitle = (props) => {
        if (this.state.playing === false) {
            return(
                <div>
                    <div>
                        <img src={ShedLogo} alt={wood} className="ShedLogo"/>
                    </div>
                    <div>
                        <Link to="/lobby">
                            <button className="playButton" onClick={() => this.setState({ playing: true})}>
                                Play
                            </button>
                        </Link>
                    </div>
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