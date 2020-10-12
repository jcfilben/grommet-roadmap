import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Grid,
  Header,
  Heading,
  Keyboard,
  ResponsiveContext,
  Text,
  ThemeContext,
} from 'grommet';
import { Add, Blank, Navigate, Next, Previous, Share } from 'grommet-icons';
import { grommet } from 'grommet/themes';
import { hpe } from 'grommet-theme-hpe';
import { addMonths, sameMonth, subtractMonths } from './utils';
import { get } from './data';
import Swipe from './Swipe';
import ItemEdit from './ItemEdit';
import RoadmapEdit from './RoadmapEdit';
import Auth from './Auth';

const themes = {
  hpe: hpe,
  grommet: grommet,
};

const monthCounts = {
  small: 1,
  medium: 3,
  large: 5,
};

const columnPercents = {
  small: 'full',
  medium: '33.33%',
  large: '20%',
};

const now = new Date();
now.setDate(1);

const Roadmap = ({ identifier, onClose }) => {
  const responsive = useContext(ResponsiveContext);
  const [date, setDate] = useState(now);
  const [auth, setAuth] = useState();
  const [password, setPassword] = React.useState();
  const [roadmap, setRoadmap] = useState();
  const [editing, setEditing] = useState();
  const [editRoadmap, setEditRoadmap] = useState();
  const [itemIndex, setItemIndex] = useState();

  useEffect(() => {
    get(password ? { ...identifier, password } : identifier)
      .then(setRoadmap)
      .catch((status) => {
        if (status === 401) setAuth(true);
        if (status === 404) onClose();
      });
  }, [identifier, onClose, password]);

  useEffect(() => {
    if (roadmap) document.title = roadmap.name;
  }, [roadmap]);

  const items = useMemo(
    () =>
      roadmap
        ? roadmap.items.map((item, index) => ({ ...item, index }))
        : undefined,
    [roadmap],
  );

  // months to show, array of Date objects
  const months = useMemo(
    () =>
      Array.from(Array(monthCounts[responsive])).map((_, i) =>
        addMonths(date, i),
      ),
    [date, responsive],
  );

  // normalize data for how we want to display it
  // section -> month -> items
  const sections = useMemo(() => {
    let result = [];
    if (roadmap) {
      const monthsItems = items.filter(({ target }) =>
        months.some((month) => sameMonth(month, target)),
      );
      result = roadmap.sections
        .map((name) => ({
          name,
          months: months.map((month) => ({
            month,
            items: monthsItems.filter(
              ({ section, target }) =>
                name === section && sameMonth(month, target),
            ),
          })),
        }))
        .filter((s) => s.months.some((m) => m.items.length));
      // add any non-section items
      const nonSectionItems = monthsItems.filter(({ section }) => !section);
      if (nonSectionItems.length) {
        result.push({
          months: months.map((month) => ({
            month,
            items: nonSectionItems.filter(({ target }) =>
              sameMonth(month, target),
            ),
          })),
        });
      }
    }
    return result;
  }, [items, months, roadmap]);

  console.log('!!!', roadmap, sections);

  const Row = (props) => {
    if (responsive === 'small') return <Box {...props} />;
    return (
      <Grid
        columns={[
          'flex',
          ['small', responsive === 'medium' ? 'large' : '80vw'],
          'flex',
        ]}
      >
        <Box />
        <Grid columns={columnPercents[responsive]} {...props} />
        <Box />
      </Grid>
    );
  };

  const onNext = useCallback(() => setDate(addMonths(date, 1)), [date]);
  const onPrevious = useCallback(() => setDate(subtractMonths(date, 1)), [
    date,
  ]);

  if (auth)
    return (
      <Auth
        onChange={(nextPassword) => {
          setPassword(nextPassword);
          setAuth(false);
        }}
      />
    );

  if (!roadmap)
    return (
      <Box fill align="center" justify="center" pad="xlarge">
        <Box animation={['fadeIn', 'pulse']}>
          <Navigate />
        </Box>
      </Box>
    );

  return (
    <ThemeContext.Extend value={themes[roadmap.theme] || themes.grommet}>
      <Keyboard
        target="document"
        onRight={onNext}
        onLeft={onPrevious}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === '.') {
            event.preventDefault();
            setEditing(!editing);
          }
        }}
      >
        <Swipe
          fill
          onSwipeLeft={onNext}
          onSwipeRight={onPrevious}
          background={editing ? { color: 'background-contrast' } : undefined}
          gap="small"
        >
          <Header background={{ color: 'background', dark: true }} pad="small">
            <Button icon={<Navigate />} onClick={onClose} />
            <Heading textAlign="center" size="24px" margin="none">
              {editing ? (
                <Button
                  label={roadmap.name}
                  onClick={() => setEditRoadmap(true)}
                />
              ) : (
                roadmap.name
              )}
            </Heading>
            {editing ? (
              <Button icon={<Add />} onClick={() => setItemIndex(-1)} />
            ) : (
              <Blank />
            )}
          </Header>
          <Box flex={false} margin={{ top: 'medium' }}>
            <Row>
              {months.map((month, index) => (
                <Box
                  key={month}
                  direction="row"
                  align="center"
                  justify="between"
                >
                  {index === 0 ? (
                    <Button
                      icon={<Previous />}
                      hoverIndicator
                      onClick={onPrevious}
                    />
                  ) : (
                    <Blank />
                  )}
                  <Text>
                    {month.toLocaleString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  {index === months.length - 1 ? (
                    <Button icon={<Next />} hoverIndicator onClick={onNext} />
                  ) : (
                    <Blank />
                  )}
                </Box>
              ))}
            </Row>
          </Box>
          <Box flex overflow="auto" pad={{ bottom: 'large' }}>
            {Object.values(sections).map(({ name, months }) => (
              <Box flex={false} key={name || 'none'}>
                <Row>
                  <Heading
                    level={3}
                    size="18px"
                    color="text-weak"
                    margin={{
                      top: 'small',
                      bottom: 'small',
                      horizontal: 'small',
                    }}
                  >
                    {name}
                  </Heading>
                </Row>
                <Row>
                  {months.map(({ month, items }) => (
                    <Box
                      key={month}
                      gap="medium"
                      pad={{ vertical: 'medium', horizontal: 'small' }}
                      background="background-back"
                      responsive={false}
                    >
                      {items.map(
                        ({ index, label: labelName, name, note, url }) => {
                          const label =
                            labelName &&
                            roadmap.labels &&
                            roadmap.labels.find(
                              ({ name }) => name === labelName,
                            );
                          let content = (
                            <Card key={name}>
                              <CardHeader>
                                <Text weight="bold" textAlign="start">
                                  {name}
                                </Text>
                                {url && <Share size="small" />}
                              </CardHeader>
                              {note && <CardBody>{note}</CardBody>}
                              {label && (
                                <CardFooter background={label.color}>
                                  <Text size="small">{label.name}</Text>
                                </CardFooter>
                              )}
                            </Card>
                          );
                          if (editing || url)
                            content = (
                              <Button
                                key={name}
                                href={editing ? undefined : url}
                                plain
                                hoverIndicator
                                onClick={
                                  editing
                                    ? () => setItemIndex(index)
                                    : undefined
                                }
                              >
                                {content}
                              </Button>
                            );
                          return content;
                        },
                      )}
                    </Box>
                  ))}
                </Row>
              </Box>
            ))}
          </Box>
          {itemIndex !== undefined && (
            <ItemEdit
              index={itemIndex}
              roadmap={roadmap}
              onChange={setRoadmap}
              onDone={() => setItemIndex(undefined)}
            />
          )}
          {editRoadmap && (
            <RoadmapEdit
              roadmap={roadmap}
              onChange={(nextRoadmap) => {
                if (nextRoadmap) setRoadmap(nextRoadmap);
                else onClose();
              }}
              onDone={() => setEditRoadmap(false)}
            />
          )}
          {editing && (
            <Box
              align="center"
              pad="xsmall"
              background={{ color: 'background-front', dark: true }}
            >
              <Text size="large">editing</Text>
            </Box>
          )}
        </Swipe>
      </Keyboard>
    </ThemeContext.Extend>
  );
};

export default Roadmap;
