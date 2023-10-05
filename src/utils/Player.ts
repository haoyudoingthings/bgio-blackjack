import { JsonProperty, Serializable, SerializableEntity } from "ts-jackson";
import { Card } from "./Card";

@Serializable()
export class Player extends SerializableEntity {
    @JsonProperty({type: Number})
    id: number;
    @JsonProperty({type: Number})
    chips: number;
    @JsonProperty({type: Number})
    highestChips: number;
    @JsonProperty({type: Number})
    betOnTable: number;
    @JsonProperty({
        type: Array,
        elementType: Card,
        deserialize: (jsonValue: Record<string, unknown>[][]): Card[][] => {
            let origin: Card[] = [];
            let split: Card[] = [];
            if (jsonValue[0].length > 0) {
                origin = jsonValue[0].map((s) => Card.deserialize(s))
            }
            if (jsonValue[1].length > 0) {
                split = jsonValue[1].map((s) => Card.deserialize(s))
            }
            return [origin, split];
        },
        serialize: (hands: Card[][]) => {
            let origin: Record<string, unknown>[] = [];
            let split: Record<string, unknown>[] = [];
            if (hands[0].length > 0) {
                origin = hands[0].map((c) => c.serialize())
            }
            if (hands[1].length > 0) {
                split = hands[1].map((c) => c.serialize())
            }
            return [origin, split]
        }
    })
    hands: Card[][];
    @JsonProperty({type: Number})
    curHand: number;
    @JsonProperty({type: Boolean})
    splitted: boolean;

    constructor(id?: number, chips?: number) {
        super();
        this.id = id || 0;
        this.chips = chips || 100;
        this.highestChips = this.chips!;
        this.hands = [[], []];
        this.curHand = 0; // 0: orignialHand, 1: splitHand
        this.betOnTable = 0;
        this.splitted = false;
    }

    addCard(c: Card): void {
        this.hands[this.curHand].push(c);
    }

    getCards(): Card[] {
        return this.hands[this.curHand];
    }

    canBet(betAmount: number): Boolean {
        return this.isEmptyHand && this.betOnTable === 0 && betAmount <= this.chips;
    }

    bet(betAmount: number): void {
        this.betOnTable += betAmount;
        this.chips -= betAmount;
    }

    win(paidOutOdds: number): void {
        this.chips += (this.betOnTable + this.betOnTable * paidOutOdds)
        this.hands[this.curHand] = [];
        if (this.isEmptyHand) {
            this.cleanup();
        }
    }

    lose(): void {
        this.hands[this.curHand] = [];
        if (this.isEmptyHand) {
            this.cleanup();
        }
    }

    tie(): void {
        this.hands[this.curHand] = [];
        this.chips += this.betOnTable;
        if (this.isEmptyHand) {
            this.cleanup();
        }
    }

    cleanup() {
        this.highestChips = Math.max(this.highestChips, this.chips);
        this.hands = [[], []];
        this.betOnTable = 0;
        this.curHand = 0;
        this.splitted = false;
    }

    get initialHand(): [Card, Card] | null {
        if (this.hands[0].length >= 2) {
            return [this.hands[0][0], this.hands[0][1]];
        }
        return null;
    }

    get currentBet(): number {
        return this.betOnTable;
    }

    get isEmptyHand() {
        return this.hands[0].length === 0 && this.hands[1].length === 0;
    }
}