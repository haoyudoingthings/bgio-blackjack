import React from "react";
import { GameContext, GameState } from "../types/GameObject";
import { Player } from "../utils/Player";
import { Card, CardFace } from "../utils/Card";

interface BoardProps {
  ctx: GameContext;
  G: GameState;
  moves: Record<string, unknown>[];
}

const Board: React.FC<BoardProps> = ({ ctx, G, moves }) => {
  const players = G.players.map((p) => Player.deserialize(p));
  // const curPlayer = players[ctx.currentPlayer]; // only allow 1 player for now
  const dealerHand = G.dealerHand.map((h) => Card.deserialize(h));

  const boardStyle = {
    border: "1px solid #555",
    width: "500px",
    height: "1000px",
    margin: "20px",
    backgroundColor: "rgba(120, 151, 137, 0.6)",
  };

  const cardFaceStyle = {
    border: "1px solid #555",
    width: "50px",
    height: "80px",
    lineHeight: "50px",
    textAlign: "center" as "center",
  };

  const cardBackStyle = {
    border: "1px solid #555",
    width: "50px",
    height: "80px",
    lineHeight: "50px",
    backgroundColor: "#0174c3",
  };

  let tbodyDealer = [];
  for (let i = 0; i < dealerHand.length; i++) {
    const c = dealerHand[i];
    tbodyDealer.push(
      <td key={"dealer_hand" + i}>
        {c.face === CardFace.up ? (
          <div style={cardFaceStyle}>{c.value}</div>
        ) : (
          <div style={cardBackStyle}></div>
        )}
      </td>
    );
  }

  let playerTables = [<div key={"dummy"}></div>];
  players.forEach((curPlayer) => {
    let tbodyPlayer = [];
    for (let i = 0; i < curPlayer.hands[0].length; i++) {
      const c = curPlayer.hands[0][i];
      tbodyPlayer.push(
        <td key={"original_hand" + i}>
          {c.face === CardFace.up ? (
            <div style={cardFaceStyle}>{c.value}</div>
          ) : (
            <div style={cardBackStyle}></div>
          )}
        </td>
      );
    }

    tbodyPlayer.push(<td key={"space"} style={{ width: "50px" }}></td>);

    for (let i = 0; i < curPlayer.hands[1].length; i++) {
      const c = curPlayer.hands[0][i];
      tbodyPlayer.push(
        <td key={"split_hand" + i}>
          {c.face === CardFace.up ? (
            <div style={cardFaceStyle}>{c.value}</div>
          ) : (
            <div style={cardBackStyle}></div>
          )}
        </td>
      );
    }

    playerTables.push(
      <div key={"player" + curPlayer.id}>
        <h2 key={"playerName" + curPlayer.id}>{"Player" + curPlayer.id}</h2>
        <table>
          <tbody>
            <tr>{tbodyPlayer}</tr>
          </tbody>
        </table>
        <div style={{ height: "30px" }}></div>
      </div>
    );
  });

  return (
    <div style={boardStyle}>
      <h1>BlackJack</h1>
      <table id="dealer">
        <tbody>
          <tr>{tbodyDealer}</tr>
        </tbody>
      </table>
      <hr />
      {playerTables}
    </div>
  );
};

export default Board;
