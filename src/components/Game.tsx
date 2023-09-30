import { GameObject } from '../types/GameObject';
import Board from './Board';
import { ScoreCalculator } from '../utils/ScoreCalculator';
let BgReact = require('boardgame.io/react');

const createGame = () => {

  return {
    name: 'Blackjack',
    setup: () => {
      const numDecks = 4; // TODO: should be adjustable
      const deck = Array(numDecks).fill(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]).flat();
      const hands: number[][] = [[], [], []];
      const curHand = 1;
      const playerChips = 100;
      const poolChips = 0;

      return ({
        numDecks,
        deck,
        hands,
        curHand,
        playerChips,
        poolChips
      });
    },
    moves: {
      bet: ({ G, events, random }: GameObject, betAmount: number) => {
        if (betAmount > G.playerChips) return;
        // shuffle cards, deals cards and check for blackjack
        if (G.deck.length < 4) return;
        G.deck = random.Shuffle(G.deck);
        G.hands[0].push(G.deck.pop()!);
        G.hands[0].push(G.deck.pop()!);
        G.hands[1].push(G.deck.pop()!);
        G.hands[1].push(G.deck.pop()!);
        const dealerBlackjack = ScoreCalculator.score(G.hands[0]) === 21;
        const playerBlackjack = ScoreCalculator.score(G.hands[1]) === 21;
        if (dealerBlackjack && playerBlackjack) {
          events.endTurn();
        } else if (dealerBlackjack) {
          G.playerChips -= betAmount;
        } else if (playerBlackjack) {
          G.playerChips += Math.floor(1.5 * betAmount);
        } else {
          G.playerChips -= betAmount;
          G.poolChips += betAmount;
        }
        
      },
      hit: ({ G, events }: GameObject) => {
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
          const playerScore = ScoreCalculator.score(G.hands[1])
          if (playerScore > dealerScore) {
            G.playerChips += 2 * G.poolChips;
          } else if (playerScore === dealerScore) {
            G.playerChips += G.poolChips;
          }
        } else {
          const playerScore1 = ScoreCalculator.score(G.hands[1])
          if (playerScore1 > dealerScore) {
            G.playerChips += G.poolChips;
          } else if (playerScore1 === dealerScore) {
            G.playerChips += Math.floor(0.5 * G.poolChips);
          }
          const playerScore2 = ScoreCalculator.score(G.hands[2])
          if (playerScore2 > dealerScore) {
            G.playerChips += G.poolChips;
          } else if (playerScore2 === dealerScore) {
            G.playerChips += Math.floor(0.5 * G.poolChips);
          }
        }
        events.endTurn();
      },
      double: ({ G, events }: GameObject) => {
        if (G.hands[2].length > 0) return; // cannot double after split
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
          const playerScore = ScoreCalculator.score(G.hands[1])
          if (playerScore > dealerScore) {
            G.playerChips += 2 * G.poolChips;
          } else if (playerScore === dealerScore) {
            G.playerChips += G.poolChips;
          }
        }
        events.endTurn();
      },
      split: ({ G }: GameObject) => {
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
        G.deck = Array(G.numDecks).fill(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]).flat();
        G.hands = [[], [], []];
        G.curHand = 1;
        G.poolChips = 0; // dealer collects chips
      }
    },
    endIf: ({ G }: GameObject) => {
      return G.playerChips + G.poolChips <= 0;
    }
  };
}

const createClient = () => {
  return BgReact.Client({
    game: createGame(),
    numPlayers: 1,
    board: Board,
    debug: true
  });
}

export default createClient;
