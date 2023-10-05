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
        onEnd: ({ G, ctx, random }: GameObject) => {
          const players = G.players.map((p) => Player.deserialize(p));
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));
          // shuffle
          dealerDeck.cards = random.Shuffle(dealerDeck.cards)

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
        endIf: ({ G, ctx }: GameObject) => {
          return G.dealerValue! > 21;
        },
        moves: {
          hit: ({ G, ctx, playerId, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p))
            const curPlayer = players[0]; // only allow 1 player for now
            const dealerDeck = DealerDeck.deserialize(G.dealerDeck);

            curPlayer.addCard(dealerDeck.dealCard(CardFace.up));
            if (ScoreCalculator.score(curPlayer.getCards()) > 21) {
              if (curPlayer.splitted && curPlayer.curHand === 0) {
                curPlayer.curHand += 1;
              } else {
                G.players = players.map((p) => p.serialize());
                G.dealerDeck = dealerDeck.serialize();
                events.endTurn();
              }
            }

            G.players = players.map((p) => p.serialize());
            G.dealerDeck = dealerDeck.serialize();
          },
          stand: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p))
            const curPlayer = players[0]; // only allow 1 player for now
            if (curPlayer.splitted && curPlayer.curHand === 0) {
              curPlayer.curHand += 1;
            } else {
              events.endTurn();
            }
            G.players = players.map((p) => p.serialize());
          },
          double: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[0]; // only allow 1 player for now
            const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
            const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));

            if (curPlayer.splitted || curPlayer.chips < curPlayer.betOnTable) {
              return; // cannot double after split or don't have enough money
            }

            curPlayer.bet(curPlayer.betOnTable);
            
            curPlayer.addCard(dealerDeck.dealCard(CardFace.up));
            if (ScoreCalculator.score(curPlayer.getCards()) > 21) {
              curPlayer.lose();
              G.players = players.map((p) => p.serialize());
              G.dealerDeck = dealerDeck.serialize();
              events.endTurn();
              return;
            }

            while (G.dealerValue! < 17) {
              dealerHand.push(dealerDeck.dealCard(CardFace.down));
              G.dealerValue = ScoreCalculator.score(dealerHand)
            } // if dealerValue > 21, this phase will end automatically

            G.players = players.map((p) => p.serialize());
            G.dealerDeck = dealerDeck.serialize();
            G.dealerHand = dealerHand.map((h) => h.serialize());
            events.endTurn();
          },
          split: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[0]; // only allow 1 player for now
            
            if (curPlayer.splitted) {
              return;
            }

            const curHand = curPlayer.getCards();
            if (curHand[0].value !== curHand[1].value) {
              return;
            }

            if (curPlayer.chips < curPlayer.betOnTable) {
              return;
            }

            const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
            
            curPlayer.split();
            curPlayer.hands[0].push(dealerDeck.dealCard());
            curPlayer.hands[1].push(dealerDeck.dealCard());
            G.players = players.map((p) => p.serialize());
            G.dealerDeck = dealerDeck.serialize();
          },
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
        onBegin: ({ G, ctx, events }: GameObject) => {
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));
          while (G.dealerValue! < 17) {
            dealerHand.push(dealerDeck.dealCard(CardFace.down));
            G.dealerValue = ScoreCalculator.score(dealerHand)
          }

          G.dealerDeck = dealerDeck.serialize();
          G.dealerHand = dealerHand.map((h) => h.serialize());
        },
        turn: {
          order: TurnOrder.ONCE,
          onBegin: ({ G, ctx, events }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[0]; // only allow 1 player for now

            for (let i = 0; i < 2; i++) {
              curPlayer.curHand = i;
              if (curPlayer.getCards().length !== 0) {
                let playerValue = ScoreCalculator.score(curPlayer.getCards());
                if (playerValue < G.dealerValue! || playerValue > 21) {
                  curPlayer.lose();
                } else if (playerValue > G.dealerValue! || G.dealerValue! > 21) {
                  curPlayer.win(1);
                } else {
                  curPlayer.tie();
                }
              }
            }
            curPlayer.curHand = 0;
            G.players = players.map((p) => p.serialize())
            events.endTurn();
          }
        },
        onEnd: ({ G, ctx }: GameObject) => {
          G.dealerHand = [];
          G.poolChips = 0;
          G.dealerValue = 0;
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          if (dealerDeck.shouldRefill) {
            dealerDeck.initial(dealerDeck.numDecks);
            G.dealerDeck = dealerDeck.serialize();
          }
        },
        next: "initialDeal",
      }
    },
  };
};
