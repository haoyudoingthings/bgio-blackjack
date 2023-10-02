import { Card, CardFace, CardType } from "./Card";

// A standard poker deck consists of 52 cards
export class StandardDeck {
    cards: Card[]

    constructor() {
        this.cards = [];
        Object.values(CardType).filter((val) => !isNaN(Number(val))).forEach((val) => {
            for (let i = 1; i <= 13; i++) {
                this.cards.push(new Card(i, val as CardType));
            }
        });
    }
}

export class DealerDeck {
    cards: Card[]

    constructor() {
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