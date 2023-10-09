import { GameObject } from "../types/GameObject";
import { Card, CardFace } from "../utils/Card";
import { DealerDeck } from "../utils/Deck";
import { Player } from "../utils/Player";

import { ScoreCalculator } from "../utils/ScoreCalculator";

import { TurnOrder, ActivePlayers } from "boardgame.io/core";

export const createGame = (numDecks: number, numPlayers: number) => {
  return {
    name: "Blackjack",
    setup: () => {
      const dealerDeck = new DealerDeck();
      dealerDeck.initial(numDecks);
      const dealerHand: Card[] = [];

      const players: Player[] = [];
      for (let i = 0; i < numPlayers; i++) {
        players.push(new Player(i, 100));
      }

      return {
        numDecks,
        dealerDeck: dealerDeck.serialize(),
        dealerHand: dealerHand.map((c) => c.serialize()),
        players: players.map((p) => p.serialize()),
      };
    },

    phases: {
      initialDeal: {
        start: true,
        endIf: ({ G }: GameObject) => {
          const players = G.players.map((p) => Player.deserialize(p));
          players.every((player) => player.currentBet > 0);
        },
        turn: {
          order: TurnOrder.ONCE,
        },
        moves: {
          bet: (
            { G, ctx, events, random, playerID }: GameObject,
            betAmount: number
          ) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];
            if (!curPlayer.canBet(betAmount)) return;
            curPlayer.bet(betAmount);
            G.players = players.map((p) => p.serialize());
            events.endTurn();
          },
        },
        onEnd: ({ G, ctx, random }: GameObject) => {
          const players = G.players.map((p) => Player.deserialize(p));
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));
          // shuffle
          dealerDeck.cards = random.Shuffle(dealerDeck.cards);

          // deal cards

          // each player get one card first
          players.forEach((player) => {
            player.addCard(dealerDeck.dealCard());
          });

          // dealer get a card, faced up
          dealerHand.push(dealerDeck.dealCard());

          // each player get second card
          players.forEach((player) => {
            player.addCard(dealerDeck.dealCard());
          });

          // dealer get second card, faced down
          dealerHand.push(dealerDeck.dealCard(CardFace.down));

          // calculate dealer value
          G.dealerValue = ScoreCalculator.score(dealerHand);

          G.players = players.map((p) => p.serialize());
          G.dealerDeck = dealerDeck.serialize();
          G.dealerHand = dealerHand.map((h) => h.serialize());

          // check for blackjack // moved to settled phase
        },
        next: ({ G }: GameObject) => {
          return G.dealerValue! >= 21 ? "settled" : "playerAction";
        },
      },

      playerAction: {
        moves: {
          hit: ({ G, ctx, playerID, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];
            const dealerDeck = DealerDeck.deserialize(G.dealerDeck);

            curPlayer.addCard(dealerDeck.dealCard(CardFace.up));
            if (ScoreCalculator.score(curPlayer.getCards()) >= 21) {
              if (curPlayer.splitted && curPlayer.curHand === 0) {
                curPlayer.curHand += 1;
              } else {
                events.endTurn();
              }
            }
            G.players = players.map((p) => p.serialize());
            G.dealerDeck = dealerDeck.serialize();
          },
          stand: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];
            if (curPlayer.splitted && curPlayer.curHand === 0) {
              curPlayer.curHand += 1;
            } else {
              events.endTurn();
            }
            G.players = players.map((p) => p.serialize());
          },
          double: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];
            const dealerDeck = DealerDeck.deserialize(G.dealerDeck);

            if (curPlayer.splitted || curPlayer.chips < curPlayer.betOnTable) {
              return; // cannot double after split or don't have enough money
            }

            curPlayer.bet(curPlayer.betOnTable);

            curPlayer.addCard(dealerDeck.dealCard(CardFace.up));

            G.players = players.map((p) => p.serialize());
            G.dealerDeck = dealerDeck.serialize();
            events.endTurn();
          },
          split: ({ G, ctx, events, random }: GameObject) => {
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];

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
            const players = G.players.map((p) => Player.deserialize(p));
            const curPlayer = players[ctx.currentPlayer];
            if (curPlayer.isEmptyHand) { // what's the purpose of this?
              events.endTurn();
            }
          },
        },
        next: "settled",
      },

      settled: {
        onBegin: ({ G, ctx, events }: GameObject) => {
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));
          const players = G.players.map((p) => Player.deserialize(p));

          dealerHand[1].face = CardFace.up;
          while (G.dealerValue! < 17) {
            dealerHand.push(dealerDeck.dealCard());
            G.dealerValue = ScoreCalculator.score(dealerHand);
          }

          G.dealerDeck = dealerDeck.serialize();
          G.dealerHand = dealerHand.map((h) => h.serialize());
          G.players = players.map((p) => p.serialize());
        },
        moves: {
          confirmResult: ({ G, ctx, playerID }: GameObject) => {
            return;
          },
        },
        turn: {
          activePlayers: ActivePlayers.ALL_ONCE,
          endIf: ({ G, ctx }: GameObject) => {
            // end if there are no active players
            return ctx.activePlayers === null;
          },
          onEnd: ({ events }: GameObject) => {
            events.endPhase();
          }
        },
        onEnd: ({ G, ctx }: GameObject) => {
          G.dealerHand = [];
          G.dealerValue = 0;
          const dealerDeck = DealerDeck.deserialize(G.dealerDeck);
          if (dealerDeck.shouldRefill) {
            dealerDeck.initial(dealerDeck.numDecks);
            G.dealerDeck = dealerDeck.serialize();
          }
          const players = G.players.map((p) => Player.deserialize(p));

          for (const curPlayer of players) {
            for (let i = 0; i < 2; i++) {
              curPlayer.curHand = i;
              if (curPlayer.getCards().length !== 0) {
                let playerValue = ScoreCalculator.score(curPlayer.getCards());
                if (playerValue < G.dealerValue! || playerValue > 21) {
                  curPlayer.lose();
                } else if ( // player has blackjack
                  playerValue === 21 && 
                  G.dealerValue !== 21 && 
                  curPlayer.hands[0].length === 2 &&
                  curPlayer.hands[1].length === 0
                ) {
                  curPlayer.win(1.5);
                } else if (
                  playerValue > G.dealerValue! ||
                  G.dealerValue! > 21
                ) {
                  curPlayer.win(1);
                } else {
                  curPlayer.tie();
                }
              }
            }
            curPlayer.curHand = 0;
          }
          G.players = players.map((p) => p.serialize());
        },
        next: "initialDeal",
      },
    },
  };
};
