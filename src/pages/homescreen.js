import React, {useEffect} from 'react';
import "./Style.css"
import ShedLogo from '../images/Logo.png'
import wood from '../images/UI/wood.png'


export const Homescreen = (props) => {     
    useEffect(()=>{
        localStorage.clear()
    }, [])
    
    return(
        <div> 
            <img src={ShedLogo} alt={wood} className="ShedLogo"/>
        
            <button className="biggerButton" onClick={() => props.history.push("/lobby")}>
                Play
            </button>
        </div>
    )
       
      

}


export default Homescreen;