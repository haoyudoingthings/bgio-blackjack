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
  endPhase: () => void;
  endTurn: () => void;
  endStage: () => void;
  setActivePlayers: ({ all, minMoves, maxMoves }: {
    all: string, 
    minMoves: number, 
    maxMoves: number
  }) => void;
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
  dealerDeck: Record<string, unknown>; // <Card[]>, an array of remaining cards
  dealerHand: Record<string, unknown>[]; // <Card[]>, an array of dealer's cards
  dealerValue?: number;
  // poolChips: number; // chips on the table
  players: Record<string, unknown>[]; // <Player[]>
}

export interface GameObject {
  G: GameState;
  ctx: GameContext;
  playerID: string;
  events: Events;
  random: Random;
}
