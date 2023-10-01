interface GameOver {
  winner: number;
}

interface Random {
  Shuffle: (deck: number[]) => number[];
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
}

export interface GameState {
  numDecks: number; // number of decks of 52 playing cards used in each game
  deck: number[]; // an array of remaining cards
  hands: number[][]; // hands[0]: dealerHand; hands[1]: playerHand; hands[2]: splitHand
  curHand: number; // can be "playerHand" or "splitHand"
  playerChips: number; // chips held by player
  poolChips: number; // chips on the table
  highestChips: number // highest chips the player has ever held
}

export interface GameObject {
  G: GameState;
  ctx: GameContext;
  events: Events;
  random: Random
}