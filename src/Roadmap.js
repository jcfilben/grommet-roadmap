import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Heading,
  Keyboard,
  ResponsiveContext,
  Text,
} from "grommet";
import { Blank, Next, Previous, StatusGood, StatusWarning } from "grommet-icons";
import { addMonths, sameMonth, subtractMonths } from "./utils";
import Swipe from "./Swipe";

const Roadmap = ({ data }) => {
  const responsive = useContext(ResponsiveContext);
  const [date, setDate] = useState(new Date());

  // months to show, array of Date objects
  const months = useMemo(
    () =>
      Array.from(Array(responsive === "small" ? 1 : 3)).map((_, i) =>
        addMonths(date, i)
      ),
    [date, responsive]
  );

  // normalize data for how we want to display it
  // type -> month -> items
  const types = useMemo(() => {
    const items = data.items.filter(({ target }) =>
      months.some((month) => sameMonth(month, target))
    );
    return Array.from(new Set(items.map((i) => i.type))).map((name) => ({
      name,
      months: months.map((month) => ({
        month,
        items: items.filter(
          ({ type, target }) => name === type && sameMonth(month, target)
        ),
      })),
    }));
  }, [data, months]);

  const Row = (props) => (
    <Grid
      columns={responsive === "small" ? "auto" : ["1/3", "1/3", "1/3"]}
      {...props}
    />
  );

  const onNext = useCallback(() => setDate(addMonths(date, 1)), [date]);
  const onPrevious = useCallback(() => setDate(subtractMonths(date, 1)), [
    date,
  ]);

  return (
    <Keyboard target="document" onRight={onNext} onLeft={onPrevious}>
      <Swipe onSwipeLeft={onNext} onSwipeRight={onPrevious}>
        <Row>
          {months.map((month, index) => (
            <Box key={month} direction="row" align="center" justify="between">
              {index === 0 ? (
                <Button
                  icon={<Previous />}
                  hoverIndicator
                  onClick={onPrevious}
                />
              ) : (
                <Blank />
              )}
              <Heading level={2} size="small">
                {month.toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </Heading>
              {index === months.length - 1 ? (
                <Button icon={<Next />} hoverIndicator onClick={onNext} />
              ) : (
                <Blank />
              )}
            </Box>
          ))}
        </Row>
        {Object.values(types).map(({ name, months }) => (
          <Box key={name}>
            <Heading level={3} size="small" color="text-weak">
              {name}
            </Heading>
            <Row>
              {months.map(({ month, items }) => (
                <Box key={month}>
                  {items.map(({ name, status, url }) => (
                    <Button key={name} href={url} disabled={!url}>
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
                        <Text weight="normal">{name}</Text>
                        {status === "ok" ? (
                          <StatusGood color="status-ok" />
                        ) : (
                          <StatusWarning color="status-warning" />
                        )}
                      </Box>
                    </Button>
                  ))}
                </Box>
              ))}
            </Row>
          </Box>
        ))}
      </Swipe>
    </Keyboard>
  );
};

export default Roadmap;
