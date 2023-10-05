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
        dealerDeck: dealerDeck.serialize(),
        dealerHand: dealerHand.map((c) => c.serialize()),
        poolChips,
        players: players.map((p) => p.serialize()),
      });
    },

    phases: {
      initialDeal: {
        start: true,
        endIf: ({ G }: GameObject) => {
          const players = G.players.map((p) => Player.deserialize(p))
          players.every((player) => player.currentBet > 0)
        },
        turn: {
          order: TurnOrder.ONCE,
        },
        moves: {
          bet: ({ G, ctx, events, random }: GameObject, betAmount: number) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[0]; // only allow 1 player for now
            if (!curPlayer.canBet(betAmount)) return;
            curPlayer.bet(betAmount);
            G.poolChips += betAmount;
            G.players = players.map((p) => p.serialize())
            events.endTurn();
          }
        },
        onEnd: ({ G, ctx }: GameObject) => {
          const players = G.players.map((p) => Player.deserialize(p));
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));
          // deal cards

          // each player get one card first
          players.forEach((player) => {
            player.addCard(dealerDeck.dealCard());
          })

          // dealer get a card, faced up
          dealerHand.push(dealerDeck.dealCard())
          
          // each player get second card
          players.forEach((player) => {
            player.addCard(dealerDeck.dealCard());
          })
          
          // dealer get second card, faced down
          dealerHand.push(dealerDeck.dealCard(CardFace.down));

          // calculate dealer value
          G.dealerValue = ScoreCalculator.score(dealerHand);

          // check for blackjack
          players.forEach((player) => {
            if (ScoreCalculator.checkBlackjack(...player.initialHand!)) {
              player.win(1.5);
            }
          })

          G.players = players.map((p) => p.serialize())
          G.dealerDeck = dealerDeck.serialize()
          G.dealerHand = dealerHand.map((h) => h.serialize())
        },
        next: "playerAction",
      },

      playerAction: {
        moves: {
          hit: ({ G, ctx, playerId, events, random }: GameObject) => {},
          stand: ({ G, ctx, events, random }: GameObject) => {},
          double: ({ G, ctx, events, random }: GameObject) => {},
          split: ({ G, ctx, events, random }: GameObject) => {},
        },
        turn: {
          order: TurnOrder.ONCE, //This is another round-robin, but it goes around only once. After this, the phase ends automatically.
          onBegin: ({ G, ctx, events }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p))
            const curPlayer = players[0]; // only allow 1 player for now
            if (curPlayer.isEmptyHand) {
              events.endTurn();
            }
          }
        },
        next: "settled",
      },

      settled: {
        onBegin: ({ G, ctx, events }: GameObject) => {},
        turn: {
          order: TurnOrder.ONCE,
          onBegin: ({ G, ctx, events }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[0]; // only allow 1 player for now
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

            G.players = players.map((p) => p.serialize())
            events.endTurn();
          }
        },
        next: "initialDeal",
      }
    },
  };
};
