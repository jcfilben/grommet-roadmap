import React, { useState } from 'react';
import {
  Box,
  Button,
  Footer,
  Form,
  FormField,
  Header,
  Layer,
  RadioButtonGroup,
  TextArea,
  TextInput,
} from 'grommet';
import { Calendar, Close } from 'grommet-icons';
import { update } from './data';
import Status from './Status';
import Auth from './Auth';

const defaultItem = { name: '', section: '', target: '', status: '', url: '' };
const statusOptions = ['ready', 'in progress', 'done', 'none'];

const ItemEdit = ({ index, roadmap, onChange, onDone }) => {
  const [value, setValue] = useState(
    index >= 0 ? roadmap.items[index] : defaultItem,
  );
  const [changing, setChanging] = useState();
  const [auth, setAuth] = useState();

  const submit = (password) => {
    setChanging(true);
    setAuth(false);

    const nextRoadmap = JSON.parse(JSON.stringify(roadmap));
    const nextItem = { ...value };
    delete nextItem.index;
    if (nextItem.status === 'none') delete nextItem.status;
    if (!nextItem.url) delete nextItem.url;
    if (index >= 0) nextRoadmap.items[index] = nextItem;
    else nextRoadmap.items.unshift(nextItem);
    // add section, if needed
    if (!nextRoadmap.sections.find((s) => nextItem.section)) {
      nextRoadmap.sections.push(nextItem.section);
    }

    update(nextRoadmap, password)
      .then(() => {
        setChanging(false);
        onChange(nextRoadmap);
        onDone();
        if (index >= 0) onDone();
      })
      .catch((status) => {
        if (status === 401) setAuth(true);
        else onDone();
      });
  };

  return (
    <Layer position="center" onEsc={onDone}>
      <Box>
        <Header justify="end">
          <Button icon={<Close />} onClick={onDone} />
        </Header>
        <Box pad={{ horizontal: 'large', vertical: 'small' }} width="large">
          {auth ? (
            <Auth onChange={submit} />
          ) : (
            <Form value={value} onChange={setValue} onSubmit={() => submit()}>
              <Box
                direction="row-responsive"
                align="center"
                justify="between"
                gap="small"
                margin={{ bottom: 'medium' }}
              >
                <FormField
                  name="section"
                  htmlFor="section"
                  required
                  margin="none"
                >
                  <TextInput
                    name="section"
                    id="section"
                    placeholder="Section"
                    suggestions={Array.from(
                      new Set(roadmap.items.map((i) => i.section)),
                    )}
                    onSelect={() => {} /* TODO */}
                  />
                </FormField>
                <FormField
                  name="target"
                  htmlFor="target"
                  required
                  margin="none"
                >
                  {/* replace with DateInput soon! */}
                  <TextInput
                    name="target"
                    id="target"
                    placeholder="yyyy-mm-dd"
                    icon={<Calendar />}
                    reverse
                  />
                </FormField>
                <FormField name="status" htmlFor="status" margin="none">
                  <RadioButtonGroup
                    name="status"
                    id="status"
                    direction="row"
                    gap="none"
                    options={statusOptions}
                  >
                    {(option, { checked, hover }) => (
                      <Status value={option} active={checked} />
                    )}
                  </RadioButtonGroup>
                </FormField>
              </Box>
              <FormField name="name" htmlFor="name" required>
                <TextInput
                  name="name"
                  id="name"
                  size="large"
                  placeholder="Label"
                />
              </FormField>
              <FormField
                name="note"
                htmlFor="note"
                margin={{ bottom: 'medium' }}
              >
                <TextArea name="note" id="note" placeholder="Note" />
              </FormField>

              <FormField name="url" htmlFor="url">
                <TextInput name="url" id="url" placeholder="URL" />
              </FormField>
              <Footer margin={{ vertical: 'medium' }}>
                <Button
                  type="submit"
                  primary
                  label={index >= 0 ? 'Update' : 'Add'}
                  disabled={changing}
                />
                {index >= 0 && (
                  <Button
                    label="Delete"
                    onClick={() => {
                      setChanging(true);
                      const nextRoadmap = JSON.parse(JSON.stringify(roadmap));
                      nextRoadmap.items.splice(index, 1);
                      update(nextRoadmap).then(() => {
                        setChanging(false);
                        onChange(nextRoadmap);
                        if (index >= 0) onDone();
                      });
                    }}
                  />
                )}
              </Footer>
            </Form>
          )}
        </Box>
      </Box>
    </Layer>
  );
};

export default ItemEdit;
