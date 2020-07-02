import React, { useEffect, useMemo } from "react";
import { Box, Grid, Grommet, Heading } from "grommet";
import { grommet } from "grommet/themes";
import { hpe } from "grommet-theme-hpe";
import Roadmap from "./Roadmap";
import data from "./data";

const themes = {
  hpe: hpe,
  grommet: grommet,
};

const App = () => {
  const theme = useMemo(() => themes[data.theme] || themes.grommet, []);

  useEffect(() => {
    document.title = data.name;
  }, [])

  return (
    <Grommet full theme={theme} background="background-back">
      <Grid columns={["flex", ["small", "xlarge"], "flex"]}>
        <Box />
        <Box margin={{ horizontal: "large" }}>
          <Box alignSelf="center">
            <Heading textAlign="center" size="small">
              {data.name}
            </Heading>
          </Box>
          <Roadmap data={data} />
        </Box>
        <Box />
      </Grid>
    </Grommet>
  );
}

export default App;
