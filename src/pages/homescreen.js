import React from 'react';
import "./Style.css"
import ShedLogo from '../images/Logo.png'
import wood from '../images/UI/wood.png'


export const Homescreen = (props) => {      
    return(
        <div>
            <div>
                <img src={ShedLogo} alt={wood} className="ShedLogo"/>
            </div>
            <div>
                <button className="playButton" onClick={() => props.history.push("/lobby")}>
                    Play
                </button>
            </div>
        </div>
    )
       
      

}


export default Homescreen;