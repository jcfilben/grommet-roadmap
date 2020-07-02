import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Grommet,
  Header,
  Heading,
  ResponsiveContext,
  Text,
} from "grommet";
import { Next, Previous, StatusGood, StatusWarning } from "grommet-icons";
import { grommet } from "grommet/themes";

import data from "./data";

const addMonths = (date, months) => {
  const result = new Date(date);
  const years = Math.floor((date.getMonth() + months) / 12);
  result.setFullYear(date.getFullYear() + years);
  const targetMonth = (date.getMonth() + months) % 12;
  result.setMonth(targetMonth < 0 ? 12 + targetMonth : targetMonth);
  return result;
};

const subtractMonths = (date, months) => addMonths(date, -months);

const sameMonth = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
};

const Row = (props) => <Grid columns={["1/3", "1/3", "1/3"]} {...props} />;

const Month = ({ date }) => (
  <Heading level={2} size="small">
    {date.toLocaleString(undefined, { month: "long", year: 'numeric' })}
  </Heading>
);

const Type = ({ name }) => (
  <Heading level={3} size="small">
    {name}
  </Heading>
);

const Item = ({ item: { name, status } }) => (
  <Box
    pad="small"
    background="background-front"
    margin="small"
    round="xsmall"
    direction="row"
    align="center"
    justify="between"
    gap="small"
  >
    <Text>{name}</Text>
    {status === "ok" ? (
      <StatusGood color="status-ok" />
    ) : (
      <StatusWarning color="status-warning" />
    )}
  </Box>
);

function App() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    document.title = data.name;
  }, []);

  // month oriented structure
  // month -> types -> items
  const months = useMemo(
    () =>
      // fixed to three months for now
      [date, addMonths(date, 1), addMonths(date, 2)].map((m) => {
        const items = data.items.filter(({ target }) => sameMonth(m, target));
        return {
          date: m,
          types: Array.from(new Set(items.map((i) => i.type))).map((name) => ({
            name,
            items: items.filter(({ type }) => type === name),
          })),
        };
      }),
    [date]
  );

  // normalize data
  // type -> month -> items
  const types = useMemo(() => {
    const items = data.items.filter(({ target }) =>
      months.some((m) => sameMonth(m.date, target))
    );
    return Array.from(new Set(items.map((i) => i.type))).map((name) => ({
      name,
      months: months.map(({ date }) => ({
        date,
        items: items.filter(({ target }) => sameMonth(date, target)),
      })),
    }));
  }, [months]); // data never changes, yet

  const previous = (
    <Button
      icon={<Previous />}
      hoverIndicator
      onClick={() => setDate(subtractMonths(date, 1))}
    />
  );

  const next = (
    <Button
      icon={<Next />}
      hoverIndicator
      onClick={() => setDate(addMonths(date, 1))}
    />
  );

  return (
    <Grommet full theme={grommet} background="background-back">
      <ResponsiveContext.Consumer>
        {(responsive) => (
          <Grid columns={["flex", ["small", "xlarge"], "flex"]}>
            <Box />
            <Box margin={{ horizontal: "large" }}>
              <Box alignSelf="center">
                <Heading textAlign="center" size="small">{data.name}</Heading>
              </Box>
              {responsive === "small" ? (
                <Box>
                  {months.slice(0, 1).map(({ date, types }) => (
                    <Box>
                      <Header>
                        {previous}
                        <Month date={date} />
                        {next}
                      </Header>
                      {types.map(({ name, items }) => (
                        <Box>
                          <Type name={name} />
                          {items.map((item) => (
                            <Item key={item.name} item={item} />
                          ))}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  <Row>
                    {months.map(({ date }, index) => (
                      <Box direction="row" align="center" justify="between">
                        {index === 0 ? previous : <Box />}
                        <Month key={date} date={date} />
                        {index === months.length - 1 ? next : <Box />}
                      </Box>
                    ))}
                  </Row>
                  {Object.values(types).map(({ name, months }) => (
                    <Box key={name}>
                      <Type name={name} />
                      <Row>
                        {months.map(({ date, items }) => (
                          <Box key={date}>
                            {items.map((item) => (
                              <Item key={item.name} item={item} />
                            ))}
                          </Box>
                        ))}
                      </Row>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box />
          </Grid>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
}

export default App;
