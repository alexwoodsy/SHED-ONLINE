import React from 'react';
import { Card } from '../game/Game'
import { Image, Text } from 'react-konva';
import useImage from 'use-image';
import CardImages from './CardImages';

const DEBUG = true;




//retrun index in CradImages.Faces of corresponding cards
function GetFace(card) {
    let image;
    switch (card.suit) {
        case "hearts":
            image = CardImages.Faces.hearts[card.rank-2]
            break;
        case "diamonds":
            image = CardImages.Faces.diamonds[card.rank-2]
            break;
        case "spades":
            image = CardImages.Faces.spades[card.rank-2]
            break;
        case "clubs":
            image = CardImages.Faces.clubs[card.rank-2]
            break;
        default:
            break;
    }
    
    return image
}



export const CardImage = (props) => {  
    const [back] = useImage(CardImages.Back);
    
    let card = props.card;
    let cardImg = GetFace(card);
    console.log(cardImg)
    const [front] = useImage(cardImg)

    let opacity = 1;

    if (card.invisible && props.reverse===false) {
        opacity = 0.5
    }; 



    
    if (props.reverse===true) {
        return (
            <Image image={back} x={props.x} y={props.y}
            width={props.width} rotation = {props.rotation} 
            height={props.height} shadowBlur={15} 
            player={props.player} onClick={props.onClick}
            />
          );
    } else {

        if (DEBUG) {
            let cardtext = card.rank.toString().concat(card.suit);
            return(
                <Text x={props.x} y={props.y} rotation={props.rotation-90} opacity={opacity} text={cardtext} fontSize={18} />
            )
        } else {
            return (
                <Image 
                    image={front} 
                    x={props.x} 
                    y={props.y} 
                    width={props.width} 
                    opacity={opacity} 
                    rotation = {props.rotation} 
                    height={props.height} 
                    shadowBlur={props.shadowBlur} 
                    player={props.player} 
                    onClick={props.onClick}
                    />
                );
        }
    }
}
//old react component for text:

//<Text x={props.x} y={props.y} rotation={props.rotation-90} opacity={opacity} text={cardtext} fontSize={18} />

//export default CardImage
//