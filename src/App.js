import React, { useEffect, useState } from 'react';
import { Box, Grid, Grommet } from 'grommet';
import { grommet } from 'grommet/themes';
import Roadmap from './Roadmap';
import Manage from './Manage';

const App = () => {
  const [identifier, setIdentifier] = useState();

  // load id from URL, if any
  useEffect(() => {
    const id = window.location.pathname.slice(1);
    setIdentifier(id ? { id } : false);
  }, []);

  return (
    <Grommet full theme={grommet} background="background-back">
      <Grid fill columns={['flex', ['small', 'xlarge'], 'flex']}>
        <Box />
        <Box margin={{ horizontal: 'large' }}>
          {identifier ? (
            <Roadmap
              identifier={identifier}
              onClose={() => {
                window.history.pushState(undefined, undefined, '/');
                setIdentifier(undefined);
              }}
            />
          ) : (
            <Manage
              onSelect={(nextIdentifier) => {
                window.history.pushState(
                  undefined,
                  undefined,
                  `/${nextIdentifier.id}`,
                );
                setIdentifier(nextIdentifier);
              }}
            />
          )}
        </Box>
        <Box />
      </Grid>
    </Grommet>
  );
};

export default App;
