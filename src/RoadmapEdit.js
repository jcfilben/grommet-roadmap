import React, { useState } from 'react';
import {
  Box,
  Button,
  CheckBox,
  Footer,
  Form,
  FormField,
  Header,
  Heading,
  Layer,
  Select,
  TextInput,
} from 'grommet';
import { Close, Down, Up } from 'grommet-icons';
import { delet, update } from './data';
import Auth from './Auth';

const RoadmapEdit = ({ roadmap, onChange, onDone }) => {
  const [value, setValue] = useState(roadmap);
  const [changing, setChanging] = useState();
  const [auth, setAuth] = useState();

  const submit = (password) => {
    setChanging(true);
    setAuth(false);
    update(value, password)
      .then(() => {
        setChanging(false);
        onChange(value);
        onDone();
      })
      .catch((status) => {
        if (status === 401) setAuth(true);
        else onDone();
      });
  };

  return (
    <Layer position="top" onEsc={onDone}>
      <Box>
        <Header justify="end">
          <Button icon={<Close />} onClick={onDone} />
        </Header>
        <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
          {auth ? (
            <Auth onChange={submit} />
          ) : (
            <Form value={value} onChange={setValue} onSubmit={() => submit()}>
              <FormField name="name" htmlFor="name" required>
                <TextInput
                  name="name"
                  id="name"
                  size="large"
                  placeholder="Name"
                />
              </FormField>
              <FormField name="password" htmlFor="password">
                <TextInput
                  name="password"
                  id="password"
                  placeholder="Password"
                  type="password"
                />
              </FormField>
              <FormField name="private" htmlFor="private">
                <CheckBox name="private" id="private" label="Private" toggle />
              </FormField>
              <FormField name="theme" htmlFor="theme">
                <Select
                  name="theme"
                  id="theme"
                  placeholder="Theme"
                  options={['grommet', 'hpe']}
                />
              </FormField>
              <Box gap="small">
                <Heading level={3} size="small" margin="none">
                  Sections
                </Heading>
                {value.sections.map((section, index) => (
                  <Box key={index} direction="row">
                    <TextInput
                      value={section}
                      onChange={(event) => {
                        const nextValue = JSON.parse(JSON.stringify(value));
                        const nextSection = event.target.value;
                        nextValue.sections[index] = nextSection;
                        nextValue.items.forEach((i) => {
                          if (i.section === section) i.section = nextSection;
                        });
                        setValue(nextValue);
                      }}
                    />
                    <Button
                      icon={<Up />}
                      disabled={index === 0}
                      onClick={() => {
                        const nextValue = JSON.parse(JSON.stringify(value));
                        const tmpSection = nextValue.sections[index - 1];
                        nextValue.sections[index - 1] = section;
                        nextValue.sections[index] = tmpSection;
                        setValue(nextValue);
                      }}
                    />
                    <Button
                      icon={<Down />}
                      disabled={index === roadmap.sections.length - 1}
                      onClick={() => {
                        const nextValue = JSON.parse(JSON.stringify(value));
                        const tmpSection = nextValue.sections[index + 1];
                        nextValue.sections[index + 1] = section;
                        nextValue.sections[index] = tmpSection;
                        setValue(nextValue);
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Footer margin={{ vertical: 'medium' }}>
                <Button
                  type="submit"
                  label="Update"
                  primary
                  disabled={changing}
                />
                <Button
                  label="Delete"
                  onClick={() => {
                    setChanging(true);
                    delet(roadmap).then(() => {
                      setChanging(false);
                      onChange(undefined);
                      onDone();
                    });
                  }}
                />
              </Footer>
            </Form>
          )}
        </Box>
      </Box>
    </Layer>
  );
};

export default RoadmapEdit;
