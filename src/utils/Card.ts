export enum CardType {
    club,
    diamond,
    heart,
    spade
}

export enum CardFace {
    up,
    down
}

export class Card {
    number: number
    type: CardType
    face: CardFace
    
    constructor(number: number, type: CardType) {
        this.number = number;
        this.type = type;
        this.face = CardFace.up;
    }

    get value() {
        if (this.number >= 10) {
            return 10;
        } 
        return this.number
    }
}