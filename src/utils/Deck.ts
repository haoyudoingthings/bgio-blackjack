import { JsonProperty, Serializable, SerializableEntity } from "ts-jackson";
import { Card, CardFace, CardType } from "./Card";

// A standard poker deck consists of 52 cards
@Serializable()
export class StandardDeck extends SerializableEntity {
    @JsonProperty({
        type: Array,
        elementType: Card,
    })
    cards: Card[]

    constructor() {
        super()
        this.cards = [];
        Object.values(CardType).filter((val) => !isNaN(Number(val))).forEach((val) => {
            for (let i = 1; i <= 13; i++) {
                this.cards.push(new Card(i, val as CardType));
            }
        });
    }
}

@Serializable()
export class DealerDeck extends SerializableEntity {
    @JsonProperty({
        type: Array,
        elementType: Card,
    })
    cards: Card[]

    constructor() {
        super();
        this.cards = [];
    }

    initial(numDecks: number): void {
        this.cards = [];
        for (let i = 0; i < numDecks; i++) {
            const deck = new StandardDeck();
            this.cards.push(...deck.cards);
        }
    }

    dealCard(face: CardFace = CardFace.up): Card {
        const c = this.cards.pop()!;
        c.face = face;
        return c;
    }
}