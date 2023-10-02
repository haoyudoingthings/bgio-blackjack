import { Card } from "./Card";

export class Player {
    id: number;
    chips: number;
    highestChips: number;
    betOnTable: number;
    hands: Card[][];
    curHand: number;
    splitted: boolean;

    constructor(id: number, chips: number) {
        this.id = id;
        this.chips = chips;
        this.highestChips = chips;
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
        return this.hands[0].length == 0 && this.hands[1].length == 0;
    }
}