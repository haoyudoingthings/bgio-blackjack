import { GameObject } from '../types/GameObject';
import { Card, CardFace } from '../utils/Card';
import { DealerDeck } from '../utils/Deck';
import { Player } from '../utils/Player';

import { ScoreCalculator } from '../utils/ScoreCalculator';

import { TurnOrder } from 'boardgame.io/core';

export const createGame = (numDecks: number, numPlayers: number) => {

  return {
    name: 'Blackjack',
    setup: () => {
      const dealerDeck = new DealerDeck();
      dealerDeck.initial(numDecks);
      const dealerHand: Card[] = [];

      const players: Player[] = [];
      for (let i = 0; i < numPlayers; i++) {
        players.push(new Player(i, 100));
      }

      const poolChips = 0;

      return ({
        numDecks,
        dealerDeck,
        dealerHand,
        poolChips,
        players
      });
    },

    phases: {
      initialDeal: {
        start: true,
        endIf: ({ G }: GameObject) => {
          G.players.every((player) => player.currentBet > 0)
        },
        moves: {
          bet: ({ G, ctx, events, random }: GameObject, betAmount: number) => {
            const curPlayer = G.players[0]; // only allow 1 player for now
            if (!curPlayer.canBet(betAmount)) return;
            curPlayer.bet(betAmount);
            G.poolChips += betAmount;
            events.endTurn();
          }
        },
        onEnd: ({ G, ctx }: GameObject) => {
          // deal cards

          // each player get one card first
          G.players.forEach((player) => {
            player.addCard(G.dealerDeck.dealCard());
          })

          // dealer get a card, faced up
          G.dealerHand.push(G.dealerDeck.dealCard())
          
          // each player get second card
          G.players.forEach((player) => {
            player.addCard(G.dealerDeck.dealCard());
          })
          
          // dealer get second card, faced down
          // G.dealerHand.push(G.dealerDeck.dealCard(CardFace.down));

          // check for blackjack
          G.players.forEach((player) => {
            if (ScoreCalculator.checkBlackjack(...player.initialHand!)) {
              player.win(1.5);
            }
          })
        },
        next: "playerAction",
      },

      playerAction: {
        moves: {
          hit: ({ G, ctx, events, random }: GameObject) => {},
          stand: ({ G, ctx, events, random }: GameObject) => {},
          double: ({ G, ctx, events, random }: GameObject) => {},
          split: ({ G, ctx, events, random }: GameObject) => {},
        },
        turn: {
          order: TurnOrder.ONCE, //This is another round-robin, but it goes around only once. After this, the phase ends automatically.
          onBegin: ({ G, ctx, events }: GameObject) => {
            const curPlayer = G.players[ctx.playOrderPos];
            if (curPlayer.isEmptyHand) {
              events.endTurn();
            }
          }
        },
        next: "settled",
      },

      settled: {
        onBegin: ({ G, ctx, events }: GameObject) => { 
          // dealer get a second card, faced up
          G.dealerHand.push(G.dealerDeck.dealCard());
          G.dealerValue = ScoreCalculator.score(G.dealerHand);
        },
        turn: {
          order: TurnOrder.ONCE,
          onBegin: ({ G, ctx, events }: GameObject) => {
            const curPlayer = G.players[ctx.playOrderPos];
            if (curPlayer.isEmptyHand) {
              events.endTurn();
            }
            
            let playerValue = ScoreCalculator.score(curPlayer.getCards());
            if (playerValue > G.dealerValue!) {
              curPlayer.win(1);
            } else if (playerValue < G.dealerValue!) {
              curPlayer.lose();
            } else {
              curPlayer.tie();
            }

            if (curPlayer.splitted && curPlayer.curHand == 0) {
              curPlayer.curHand += 1
              playerValue = ScoreCalculator.score(curPlayer.getCards());
              if (playerValue > G.dealerValue!) {
                curPlayer.win(1);
              } else if (playerValue < G.dealerValue!) {
                curPlayer.lose();
              } else {
                curPlayer.tie();
              }
            }

            events.endTurn();
          }
        },
        next: "initialDeal",
      }
    },
  };
};
