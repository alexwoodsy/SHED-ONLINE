import React, {useEffect, useRef} from 'react';
import { Group, Image, Text } from 'react-konva';
import useImage from 'use-image';
import CardImages from './CardImages';
import { imageRatio } from './gameUI'




const DEBUG = false;

//retrun index in CradImages.Faces of corresponding cards
function GetFace(card) {
    if (card === null) {
        return (CardImages.Empty)
    } else if (typeof card === "string") {
        let image;
        let suit = card.substring(5)
        switch (suit) {
            case "hearts":
                image = CardImages.Ash.hearts
                break;
            case "diamonds":
                image = CardImages.Ash.diamonds
                break;
            case "spades":
                image = CardImages.Ash.spades
                break;
            case "clubs":
                image = CardImages.Ash.clubs
                break;
            default:
                break;
        }
        return image
    } else {
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
}

export const CardImage = (props) => {
    let card = props.card
    let rotation = props.rotation
    let cardImg = GetFace(card);
    const [front] = useImage(cardImg) 
    const [back] = useImage(CardImages.Back);
    let opacity = 1;
    let shadowColor;
    if (props.highlight==="green") {
        shadowColor = "#4feb34"
    } else if (props.highlight==="white") {
        shadowColor = "white"
    } else {
      shadowColor = "black"
    }
    const scaledDims = (x, y, width, height) => {
        let scaleFactor = 1.5
        return ({
            x: x-width*(scaleFactor-1)/2,
            y: y-height*(scaleFactor-1)/2 - 3*height/4 ,
            width: scaleFactor*width,
            height: scaleFactor*height,
        })
    }

    let expanded = scaledDims(props.x, props.y, props.width, props.height)

    const cardRef = useRef(null)
    useEffect(()=>{
        const expandCard = () => {
            //cardRef.current.moveToTop()
            cardRef.current.to({
                x: expanded.x,
                y: expanded.y,
                width: expanded.width,
                height: expanded.height,
                duration:0.2,
            });
        }
        const shrinkCard = () => {
            cardRef.current.to({
                x: props.x,
                y: props.y,
                width: props.width,
                height: props.height,
                duration:0.2,
            });
        }
       
        if (cardRef.current!==null && props.expandable && !props.isMobile) {
            cardRef.current.on('mouseover',(event)=>expandCard(event))
            cardRef.current.on('mouseout',()=>shrinkCard())
        }
    }, [cardRef, expanded, props])


    if (card === null) {
        return (
            <Image
                key={props.keyProp}
                image={front}
                x={props.x}
                y={props.y}
                width={props.width}
                rotation = {rotation}
                height={props.height}
            />
        );
    } else if (typeof card === "string") {
        let width;
        let height = props.height*0.8;
        let ratio = imageRatio(front)
        width = height * ratio
        return (
            <Image
                image={front}
                key={props.keyProp}
                x={props.x-width/5}
                y={props.y}
                width={width}
                rotation = {rotation}
                height={height}
            />
        );
    } else if (props.reverse===true) {
        if (DEBUG) {
            return null
        } else {
            return (
                <Image
                    key={props.keyProp}
                    image={back}
                    x={props.x}
                    y={props.y}
                    width={props.width}
                    height={props.height}
                    rotation = {rotation}
                    shadowBlur={props.shadowBlur}
                    shadowColor={shadowColor}
                    player={props.player}
                    onClick={props.onClick}
                    onTap={props.onTap}
                />
            );
        }

    } else {
        if (card.invisible && props.reverse===false) {
            opacity = 0.5
        };
        if (DEBUG) {
            let cardtext = card.rank.toString().concat(card.suit);
            return(
                <Text x={props.x} y={props.y} rotation={rotation-90} opacity={opacity} text={cardtext} fontSize={18} />
            )
        } else {
            let dims = {
                x: props.x,
                y: props.y,
                width: props.width,
                height: props.height
            }
            if (props.isMobile ) {
                dims = expanded
            }
            return (
                <Group>
                    <Image
                        ref={cardRef}
                        key={props.keyProp}
                        image={front}
                        x={dims.x}
                        y={props.underInvisible? dims.y + dims.height/6 : dims.y}
                        width={dims.width}
                        height={dims.height}
                        opacity={opacity}
                        rotation = {rotation}
                        shadowBlur={props.shadowBlur}
                        shadowColor={shadowColor}
                        player={props.player}
                        onClick={props.onClick}
                        onTap={props.onTap}
                    />
                </Group>  
            );
        }
    }
}


//wil give the coords + rotation for cards in a collection spaced nicely for each zone
export function CardRenderParam (rangeX, rangeY, cardwidth, cardheight, screenX, screenY, padX, padY, range, numberCards, Zone) {
    let yspacing = cardheight/2 + padY
    let xspacing = cardheight/2 + padX
    let ratioX = ((screenX-2*padX)/screenY) ;
    let ratioY = ((screenY-2*padY)/screenX);
    let Params =Array(numberCards); // [ [x, y]_n ]
    let dx =1; //cos rot
    let dy =0; // sin rot
    let originX = 0;
    let originY = screenY-padY-cardheight -rangeY +yspacing;
    let cardRotation = 0;
    switch (Zone) {
        case 'bottom':
            break;
        case 'top':
            dx=-1;
            dy=0;
            originX = screenX
            originY = padY+cardheight+rangeY - yspacing
            cardRotation = 180;
            break;
        case 'left':
            dx=0;
            dy=1;
            let tempLeft = rangeX;
            rangeX = rangeY * ratioX
            rangeY = tempLeft * ratioY

            originX = padX + rangeX - xspacing
            originY = padY + cardwidth
            cardRotation = 270;
            break;
        case 'right':
            dx=0;
            dy=-1;
            let tempRight = rangeX;
            rangeX = rangeY * ((screenX-2*padX)/screenY)
            rangeY = tempRight * ((screenY-2*padY)/screenX)

            originX = screenX -padX - rangeX + xspacing
            originY = screenY-padY-cardwidth
            cardRotation =90;
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
