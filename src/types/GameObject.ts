import { Card } from "../utils/Card";
import { DealerDeck } from "../utils/Deck";
import { Player } from "../utils/Player";

interface GameOver {
  winner: number;
}

interface Random {
  Shuffle: (deck: any[]) => any[];
}

interface Events {
  endTurn: () => void;
}

export interface GameContext {
  numPlayers: number;
  turn: number;
  currentPlayer: number;
  gameover?: GameOver;
  random: Random;
  events: Events;
  playOrderPos: number;
}

export interface GameState {
  numDecks: number; // number of decks of 52 playing cards used in each game
  dealerDeck: Record<string, unknown>; // <DealerDeck>, an array of remaining cards
  dealerHand: Record<string, unknown>[]; // <Card[]>, hands[0]: dealerHand; hands[1]: playerHand; hands[2]: splitHand
  dealerValue?: number;
  poolChips: number; // chips on the table
  players: Record<string, unknown>[]; // <Player[]>
}

export interface GameObject {
  G: GameState;
  ctx: GameContext;
  playerId: string;
  events: Events;
  random: Random
}