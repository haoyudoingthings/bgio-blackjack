import { JsonProperty, Serializable, SerializableEntity } from "ts-jackson";

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

@Serializable()
export class Card extends SerializableEntity {
    @JsonProperty({
        type: Number,
    })
    number: number
    @JsonProperty({
        type: Number,
    })
    type: CardType
    @JsonProperty({
        type: Number,
    })
    face: CardFace
    
    constructor(number?: number, type?: CardType) {
        super();
        this.number = number || 0;
        this.type = type || 0;
        this.face = CardFace.up;
    }

    get value() {
        if (this.number >= 10) {
            return 10;
        } 
        return this.number
    }
}