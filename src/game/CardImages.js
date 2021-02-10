//hearts
import clubs2 from "../images/cards/2C.png";
import clubs3 from "../images/cards/3C.png";
import clubs4 from "../images/cards/4C.png";
import clubs5 from "../images/cards/5C.png";
import clubs6 from "../images/cards/6C.png";
import clubs7 from "../images/cards/7C.png";
import clubs8 from "../images/cards/8C.png";
import clubs9 from "../images/cards/9C.png";
import clubs10 from "../images/cards/10C.png";
import clubsJ from "../images/cards/JC.png";
import clubsQ from "../images/cards/QC.png";
import clubsK from "../images/cards/KC.png";
import clubsA from "../images/cards/AC.png";
//spades
import spades2 from "../images/cards/2S.png";
import spades3 from "../images/cards/3S.png";
import spades4 from "../images/cards/4S.png";
import spades5 from "../images/cards/5S.png";
import spades6 from "../images/cards/6S.png";
import spades7 from "../images/cards/7S.png";
import spades8 from "../images/cards/8S.png";
import spades9 from "../images/cards/9S.png";
import spades10 from "../images/cards/10S.png";
import spadesJ from "../images/cards/JS.png";
import spadesQ from "../images/cards/QS.png";
import spadesK from "../images/cards/KS.png";
import spadesA from "../images/cards/AS.png";
//hearts
import hearts2 from "../images/cards/2H.png";
import hearts3 from "../images/cards/3H.png";
import hearts4 from "../images/cards/4H.png";
import hearts5 from "../images/cards/5H.png";
import hearts6 from "../images/cards/6H.png";
import hearts7 from "../images/cards/7H.png";
import hearts8 from "../images/cards/8H.png";
import hearts9 from "../images/cards/9H.png";
import hearts10 from "../images/cards/10H.png";
import heartsJ from "../images/cards/JH.png";
import heartsQ from "../images/cards/QH.png";
import heartsK from "../images/cards/KH.png";
import heartsA from "../images/cards/AH.png";
//Diamonds
import diamonds2 from "../images/cards/2D.png";
import diamonds3 from "../images/cards/3D.png";
import diamonds4 from "../images/cards/4D.png";
import diamonds5 from "../images/cards/5D.png";
import diamonds6 from "../images/cards/6D.png";
import diamonds7 from "../images/cards/7D.png";
import diamonds8 from "../images/cards/8D.png";
import diamonds9 from "../images/cards/9D.png";
import diamonds10 from "../images/cards/10D.png";
import diamondsJ from "../images/cards/JD.png";
import diamondsQ from "../images/cards/QD.png";
import diamondsK from "../images/cards/KD.png";
import diamondsA from "../images/cards/AD.png";
//card back
import cardback from "../images/cards/purple_back.png"


const CardFaces = {
    hearts: [hearts2, hearts3, hearts4, hearts5, hearts6, hearts7, hearts8, hearts9, hearts10, heartsJ, heartsQ, heartsK, heartsA],
    diamonds: [diamonds2, diamonds3, diamonds4, diamonds5, diamonds6, diamonds7, diamonds8, diamonds9, diamonds10, diamondsJ, diamondsQ, diamondsK, diamondsA], 
    spades: [spades2, spades3, spades4, spades5, spades6, spades7, spades8, spades9, spades10, spadesJ, spadesQ, spadesK, spadesA],
    clubs: [clubs2, clubs3, clubs4, clubs5, clubs6, clubs7, clubs8, clubs9, clubs10, clubsJ, clubsQ, clubsK, clubsA],
}


export const CardImages = {
    Faces: CardFaces,
    Back: cardback, 
}

//function that gets the image from the card

export default CardImages;