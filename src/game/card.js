import React from 'react';
import { Image, Text } from 'react-konva';
import useImage from 'use-image';
import CardImages from './CardImages';

const DEBUG = false;

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
    let card = props.card
    let rotation = props.rotation
    // let rotation=0;
    // if (props.player===2 || props.player===3) {
    //     rotation=90
    // } else if (props.player===0 || props.player===1){
    //     rotation=0
    // } else {
    //     rotation=0
    // }; 

    const [back] = useImage(CardImages.Back);


    let cardImg = GetFace(card);

    const [front] = useImage(cardImg)

    let opacity = 1;

    if (card.invisible && props.reverse===false) {
        opacity = 0.5
    }; 

    
    if (props.reverse===true) {
        if (DEBUG) {
            return null
        } else {
            return (
                <Image 
                    image={back} 
                    x={props.x} 
                    y={props.y}
                    width={props.width} 
                    rotation = {rotation} 
                    height={props.height}
                    shadowBlur={props.shadowBlur} 
                    player={props.player} 
                    onClick={props.onClick}
                />
            );
        }

    } else {

        if (DEBUG) {
            let cardtext = card.rank.toString().concat(card.suit);
            return(
                <Text x={props.x} y={props.y} rotation={rotation-90} opacity={opacity} text={cardtext} fontSize={18} />
            )
        } else {
            return (
                <Image 
                    image={front} 
                    x={props.x} 
                    y={props.y} 
                    width={props.width} 
                    opacity={opacity} 
                    rotation = {rotation} 
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

//wil give the coords + rotation for cards in a collection spaced nicely for each zone
export function CardRenderParam (rangeX, rangeY, cardwidth, cardheight, screenX, screenY, padX, padY, range, numberCards, Zone) {
    let ratioX = ((screenX-2*padX)/screenY) ;
    let ratioY = ((screenY-2*padY)/screenX);
    let Params =Array(numberCards); // [ [x, y]_n ]
    let dx =1; //cos rot
    let dy =0; // sin rot
    let originX = 0;
    let originY = screenY-padY-cardheight -rangeY;
    let cardRotation = 0;
    switch (Zone) {
        case 'bottom':
            break;
        case 'top':
            dx=-1;
            dy=0;
            originX = screenX
            originY = padY+cardheight+rangeY
            cardRotation = 180;
            break;
        case 'left':
            dx=0;
            dy=1; 
            let tempLeft = rangeX;
            rangeX = rangeY * ratioX
            rangeY = tempLeft * ratioY

            originX = padX + rangeX
            originY = padY + cardwidth
            cardRotation = 270;
            break;
        case 'right':
            dx=0;
            dy=-1;
            let tempRight = rangeX;
            rangeX = rangeY * ((screenX-2*padX)/screenY)
            rangeY = tempRight * ((screenY-2*padY)/screenX)

            originX = screenX -padX - rangeX
            originY = screenY-padY-cardwidth 
            cardRotation = 90;
            break;
        default:
            break;
    };  
    
    let overlap = (numberCards*cardwidth-range)/numberCards
    overlap = overlap < 0 ? 0 : overlap;
    let offset = numberCards*(cardwidth - overlap)/2
    
    
    
    for (let i=0; i<numberCards; i++ ) {
        let cardSeperationX = i*(cardwidth - overlap) 
        let cardSeperationY = i*(cardwidth - overlap);

        let cardSceenX = originX + dx*(rangeX) + dx*( cardSeperationX - offset )
        let cardScreenY = originY + dy*rangeY + dy*( cardSeperationY - offset );
        
        let coords = [cardSceenX, cardScreenY, cardRotation]
        Params[i] = coords;
    }
    return Params;
}
