import { GameObject } from '../types/GameObject';
import { ScoreCalculator } from '../utils/ScoreCalculator';

export const createGame = (numDecks: number) => {

  return {
    name: 'Blackjack',
    setup: () => {
      // const numDecks = 6; // TODO: should be adjustable
      const deck = Array(numDecks).fill(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]).flat();
      const hands: number[][] = [[], [], []];
      const curHand = 1;
      const playerChips = 100;
      const poolChips = 0;
      const highestChips = 100;

      return ({
        numDecks,
        deck,
        hands,
        curHand,
        playerChips,
        poolChips,
        highestChips
      });
    },
    moves: {
      bet: ({ G, events, random }: GameObject, betAmount: number) => {
        if (betAmount > G.playerChips || G.poolChips > 0) return;
        // shuffle cards, deals cards and check for blackjack
        G.deck = random.Shuffle(G.deck);
        G.hands[0].push(G.deck.pop()!);
        G.hands[1].push(G.deck.pop()!);
        G.hands[1].push(G.deck.pop()!);
        const dealerBlackjack = ScoreCalculator.checkBlackjack(G.hands[0][0], G.deck[G.deck.length-1]);
        const playerBlackjack = ScoreCalculator.score(G.hands[1]) === 21;
        if (dealerBlackjack && playerBlackjack) {
          G.hands[0].push(G.deck.pop()!);
          events.endTurn();
        } else if (dealerBlackjack) {
          G.hands[0].push(G.deck.pop()!);
          G.playerChips -= betAmount;
          events.endTurn();
        } else if (playerBlackjack) {
          G.playerChips += Math.floor(1.5 * betAmount);
          events.endTurn();
        } else {
          G.playerChips -= betAmount;
          G.poolChips += betAmount;
        }
      },
      hit: ({ G, events }: GameObject) => {
        if (G.hands[1].length === 0) return;
        G.hands[G.curHand].push(G.deck.pop()!);
        if (ScoreCalculator.score(G.hands[1]) > 21 &&
          G.hands[2].length > 0 &&
          G.curHand === 1) {
          G.curHand = 2;
        } else if (ScoreCalculator.score(G.hands[G.curHand]) > 21) {
          events.endTurn();
        }
      },
      stand: ({ G, events }: GameObject) => {
        if (G.hands[1].length === 0) return;
        if (G.hands[2].length > 0 && G.curHand === 1) {
          G.curHand = 2;
          return;
        }
        // dealer's play
        while (ScoreCalculator.score(G.hands[0]) < 17) {
          G.hands[0].push(G.deck.pop()!);
        }
        // pay out
        const dealerScore = ScoreCalculator.score(G.hands[0]);
        if (dealerScore > 21) {
          G.playerChips += 2 * G.poolChips;
        } else if (G.hands[2].length === 0) {
          const playerScore = ScoreCalculator.score(G.hands[1]);
          if (playerScore > dealerScore) {
            G.playerChips += 2 * G.poolChips;
          } else if (playerScore === dealerScore) {
            G.playerChips += G.poolChips;
          }
        } else {
          const playerScore1 = ScoreCalculator.score(G.hands[1]);
          if (playerScore1 > dealerScore) {
            G.playerChips += G.poolChips;
          } else if (playerScore1 === dealerScore) {
            G.playerChips += Math.floor(0.5 * G.poolChips);
          }
          const playerScore2 = ScoreCalculator.score(G.hands[2]);
          if (playerScore2 > dealerScore) {
            G.playerChips += G.poolChips;
          } else if (playerScore2 === dealerScore) {
            G.playerChips += Math.floor(0.5 * G.poolChips);
          }
        }
        events.endTurn();
      },
      double: ({ G, events }: GameObject) => {
        if (G.hands[1].length === 0) return;
        if (G.hands[2].length > 0) return; // cannot double after split
        if (G.playerChips < G.poolChips) return; // cannot double if you don't have enough money
        G.playerChips -= G.poolChips;
        G.poolChips *= 2;
        // hit one more card
        G.hands[1].push(G.deck.pop()!);
        if (ScoreCalculator.score(G.hands[1]) > 21) {
          events.endTurn();
        }
        // dealer's play
        while (ScoreCalculator.score(G.hands[0]) < 17) {
          G.hands[0].push(G.deck.pop()!);
        }
        // pay out
        const dealerScore = ScoreCalculator.score(G.hands[0]);
        if (dealerScore > 21) {
          G.playerChips += 2 * G.poolChips;
        } else {
          const playerScore = ScoreCalculator.score(G.hands[1]);
          if (playerScore > dealerScore) {
            G.playerChips += 2 * G.poolChips;
          } else if (playerScore === dealerScore) {
            G.playerChips += G.poolChips;
          }
        }
        events.endTurn();
      },
      split: ({ G }: GameObject) => {
        if (G.hands[1].length === 0) return;
        if (G.playerChips < G.poolChips) return; // cannot split if you don't have enough money
        if (G.curHand === 1 &&
          G.hands[1].length === 2 &&
          G.hands[1][0] === G.hands[1][1] &&
          G.hands[1][0] !== 1) {
          G.hands[2].push(G.hands[1].pop()!);
          G.playerChips -= G.poolChips;
          G.poolChips *= 2;
        }
      }
    },
    turn: {
      onEnd: ({ G }: GameObject) => {
        G.hands = [[], [], []];
        G.curHand = 1;
        G.poolChips = 0; // dealer collects chips
        if (G.playerChips > G.highestChips) {
          G.highestChips = G.playerChips;
        }
        if (G.deck.length < 0.25 * G.numDecks * 52) {
          G.deck = Array(G.numDecks).fill(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]).flat();
        }
      }
    },
    endIf: ({ G }: GameObject) => {
      if (G.playerChips + G.poolChips <= 0) {
        return `You could've walked away with $${G.highestChips}, but you didn't lmao`;
      }
    }
  };
};
