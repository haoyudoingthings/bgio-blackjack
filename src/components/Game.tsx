import Board from './Board';
import { createGame } from './createGame';
import { Local } from 'boardgame.io/multiplayer';
let BgReact = require('boardgame.io/react');

export type ClientProps = {
  numDecks: number;
  numPlayers: number;
}

const createClient = (props: ClientProps) => {
  return BgReact.Client({
    game: createGame(props.numDecks, props.numPlayers),
    numPlayers: props.numPlayers,
    board: Board,
    debug: true,
    multiplayer: Local()
  });
}

export default createClient;
