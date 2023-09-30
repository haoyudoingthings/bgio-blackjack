import Board from './Board';
import { createGame } from './createGame';
let BgReact = require('boardgame.io/react');

const createClient = (numDecks: number) => {
  return BgReact.Client({
    game: createGame(numDecks),
    numPlayers: 1,
    board: Board,
    debug: true
  });
}

export default createClient;
