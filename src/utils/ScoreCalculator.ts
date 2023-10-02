import { Card } from "./Card";

export interface IScoreCalculator {
  score: (hand: Card[]) => number;
  checkBlackjack: (card1: Card, card2: Card) => boolean
}
  
export const ScoreCalculator: IScoreCalculator = {
  score: (hand: Card[]) => {
    let total = 0;
    let numAce = 0;
    for (const card of hand) {
      if (card.value === 1) {
        total += 11;
        numAce += 1;
      } else {
        total += card.value;
      }
    }
    while (numAce > 0 && total > 21) {
      total -= 10;
      numAce -= 1;
    }
    return total;
  },
  checkBlackjack: (card1: Card, card2: Card) => {
    if ((card1.value === 1 && card2.value === 10) || (card1.value === 10 && card2.value === 1)) {
      return true;
    }
    return false;
  }
}