import React, { useState } from 'react';
import createClient, { ClientProps } from './components/Game';
import 'bootstrap/dist/css/bootstrap.min.css';
import Setup from './components/Setup'

const App: React.FC = () => {
  const [clientProps, setClientProps] = useState<ClientProps | null>(null);

  const onClientPropsSubmit = (props: ClientProps) => {
    setClientProps(props);
  }

  let Client;
  if (clientProps) {
    Client = createClient(clientProps);
  }

  return (
    <div>
      {
          Client ?
            <Client /> :
            <Setup onClientPropsSubmit={onClientPropsSubmit} />
        }
    </div>
  );
}

export default App;
