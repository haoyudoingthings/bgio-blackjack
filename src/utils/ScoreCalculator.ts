export interface IScoreCalculator {
  score: (hand: number[]) => number;
  checkBlackjack: (card1: number, card2: number) => boolean
}
  
export const ScoreCalculator: IScoreCalculator = {
  score: (hand: number[]) => {
    let total = 0;
    let numAce = 0;
    for (const card of hand) {
      if (card === 1) {
        total += 11;
        numAce += 1;
      } else {
        total += card;
      }
    }
    while (numAce > 0 && total > 21) {
      total -= 10;
      numAce -= 1;
    }
    return total;
  },
  checkBlackjack: (card1: number, card2: number) => {
    if ((card1 === 1 && card2 === 10) || (card1 === 10 && card2 === 1)) {
      return true;
    }
    return false;
  }
}