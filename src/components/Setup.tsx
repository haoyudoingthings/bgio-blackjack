import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';

interface SetupProps {
  handleSelection: (numDecks: number) => void;
}

const Setup: React.FC<SetupProps> = ({ handleSelection }) => {

  return (
    <Container>
      <Row>
        <Col xs={12} md={8}>
          <StyledHeader>Blackjack</StyledHeader>
          <p>How many decks?</p>
          <StyledButton onClick={() => handleSelection(2)}>2</StyledButton>
          <StyledButton onClick={() => handleSelection(4)}>4</StyledButton>
          <StyledButton onClick={() => handleSelection(6)}>6</StyledButton>
          <StyledButton onClick={() => handleSelection(8)}>8</StyledButton>
        </Col>
      </Row>
    </Container>
  );
};

const StyledHeader = styled.h1`
  text-align: center;
`;

const StyledButton = styled(Button)`
  margin-right: 2em;
`;

export default Setup;