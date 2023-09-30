import React, { useState } from 'react';
import createClient from './components/Game';
import 'bootstrap/dist/css/bootstrap.min.css';
import Setup from './components/Setup'

const App: React.FC = () => {
  const [numDecks, setNumDecks] = useState<number | null>(null);

  const handleSelection = (numDecks: number) => {
    setNumDecks(numDecks);
  }

  let Client;
  if (numDecks) {
    Client = createClient(numDecks);
  }

  return (
    <div>
      {
          Client ?
            <Client /> :
            <Setup handleSelection={handleSelection} />
        }
    </div>
  );
}

export default App;
