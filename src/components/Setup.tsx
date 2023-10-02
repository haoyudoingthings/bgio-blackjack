import React, { useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { ClientProps } from './Game';
import styled from 'styled-components';

interface SetupProps {
  onClientPropsSubmit: (props: ClientProps) => void;
}

const Setup: React.FC<SetupProps> = ({ onClientPropsSubmit }) => {
  const [inputs, setInputs] = useState({ numDecks: undefined, numPlayers: undefined });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: value }))
  }

  const handleSubmit = () => {
    if (Object.values(inputs).every(x => x !== undefined)) {
      const clientProps: ClientProps = {
        numDecks: inputs.numDecks!,
        numPlayers: inputs.numPlayers!
      }
      onClientPropsSubmit(clientProps);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>How many decks?</label>
      <input type="number" name="numDecks" value={inputs.numDecks || ""} min="1" max="5" onChange={handleChange}></input>

      <label>How many players?</label>
      <input type="number" name="numPlayers" value={inputs.numPlayers || ""} min="1" max="1" onChange={handleChange}></input>

      <input type="submit"/>
    </form>
  );
};

export default Setup;