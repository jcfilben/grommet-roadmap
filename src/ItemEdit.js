import React, { useState } from 'react';
import {
  Box,
  Button,
  DateInput,
  Footer,
  Form,
  FormField,
  Header,
  Layer,
  TextArea,
  TextInput,
} from 'grommet';
import { Close } from 'grommet-icons';
import { update } from './data';
import Auth from './Auth';

const defaultItem = { name: '', section: '', target: '', status: '', url: '' };

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
    if (!nextItem.section) delete nextItem.section;
    if (!nextItem.label) delete nextItem.label;
    if (index >= 0) nextRoadmap.items[index] = nextItem;
    else nextRoadmap.items.unshift(nextItem);
    // add section, if needed
    if (
      nextItem.section &&
      !nextRoadmap.sections.find((s) => nextItem.section)
    ) {
      nextRoadmap.sections.push(nextItem.section);
    }
    // add label, if needed
    if (!nextRoadmap.labels.find(({ name }) => name === nextItem.label)) {
      nextRoadmap.labels.push({ name: nextItem.label });
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
                align="start"
                justify="between"
                gap="small"
                margin={{ bottom: 'medium' }}
              >
                <FormField name="section" htmlFor="section" margin="none">
                  <TextInput
                    name="section"
                    id="section"
                    placeholder="Section"
                    suggestions={roadmap.sections}
                  />
                </FormField>
                <FormField
                  name="target"
                  htmlFor="target"
                  required
                  margin="none"
                >
                  <DateInput name="target" id="target" format="mm/dd/yyyy" />
                </FormField>
                <FormField name="label" htmlFor="label" margin="none">
                  <TextInput
                    name="label"
                    id="label"
                    placeholder="Label"
                    suggestions={roadmap.labels.map(({ name }) => name)}
                  />
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
