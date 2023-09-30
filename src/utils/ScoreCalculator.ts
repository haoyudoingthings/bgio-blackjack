export interface IScoreCalculator {
  score: (hand: number[]) => number;
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
  }
}