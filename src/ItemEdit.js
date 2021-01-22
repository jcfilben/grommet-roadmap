import React, { useState } from 'react';
import {
  Box,
  Button,
  DateInput,
  Footer,
  Form,
  FormField,
  Header,
  Heading,
  Layer,
  TextArea,
  TextInput,
} from 'grommet';
import { Close } from 'grommet-icons';
import { update } from './data';
import Auth from './Auth';
import {
  AddCircle,
  Figma,
  FormClose,
  FormDown,
  Github,
  Link,
} from 'grommet-icons';

const defaultItem = { name: '', section: '' };

const ItemEdit = ({ index, roadmap, onChange, onDone }) => {
  const [value, setValue] = useState(
    index >= 0 ? roadmap.items[index] : defaultItem,
  );
  const [changing, setChanging] = useState();
  const [auth, setAuth] = useState();

  const [linkFields, setLinkFields] = useState(
    index >= 0 ? roadmap.items[index].linkFields : [{ linkUrl: '' }],
  );

  const [dateFields, setDateFields] = useState(
    index >= 0
      ? roadmap.items[index].dateFields
      : [{ date: '', stage: '', progress: '' }],
  );

  const submit = (password) => {
    // remove empty link fields
    for (let i = 0; i < linkFields.length; i++) {
      delete value[`${i}DateProgress`];
      delete value[`${i}DateStage`];
      // delete value[`${i}DateTarget`];
      if (linkFields[i].linkUrl === '') linkFields.splice(i, 1);
    }
    for (let i = 0; i < dateFields.length; i++) {
      delete value[`${i}linkUrl`];
      if (dateFields[i].date === '') linkFields.splice(i, 1);
    }
    value.linkFields = JSON.parse(JSON.stringify(linkFields));
    value.dateFields = JSON.parse(JSON.stringify(dateFields));

    setChanging(true);
    setAuth(false);

    const nextRoadmap = JSON.parse(JSON.stringify(roadmap));
    const nextItem = { ...value };
    delete nextItem.index;
    console.log(nextItem);
    // if (nextItem.status === 'none') delete nextItem.status;
    // if (!nextItem.linkFields) delete nextItem.linkFields;
    if (!nextItem.section) delete nextItem.section;
    // if (!nextItem.label) delete nextItem.label;
    // if (!nextItem.progress) delete nextItem.progress;
    // if (!nextItem.date) delete nextItem.date;
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
    for (let x in dateFields)
      if (
        !nextRoadmap.labels.find(
          ({ name }) => name === nextItem.dateFields[x].stage,
        )
      ) {
        nextRoadmap.labels.push({ name: nextItem.dateFields[x].stage });
      }
    console.log(nextItem);
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

  if (Object.keys(roadmap.labels).length === 0) {
    roadmap.labels = [
      { name: 'Exploration', color: 'purple' },
      { name: 'Implement', color: 'green' },
      { name: 'Ideate', color: 'blue' },
    ];
  }

  const handleAddUrl = () => {
    const links = [...linkFields];
    links.push({ linkUrl: '' });
    setLinkFields(links);
  };

  const handleRemoveUrl = (index) => {
    const links = [...linkFields];
    links.splice(index, 1);
    setLinkFields(links);
    value[index + 'linkUrl'] = '';
  };

  const handleInputChange = (index, event) => {
    const values = [...linkFields];
    if (event.target.name.includes('linkUrl')) {
      values[index].linkUrl = event.target.value;
    }
    // console.log(values);
    setLinkFields(values);
  };

  const handleRemoveDateField = (index) => {
    const links = [...dateFields];
    links.splice(index, 1);
    setDateFields(links);
    // value[index + 'linkUrl'] = '';
  };

  const handleAddDateField = () => {
    const links = [...dateFields];
    links.push({ date: '', stage: '', progress: '' });
    setDateFields(links);
  };

  const handleDateInputChange = (index, event) => {
    const values = [...dateFields];
    if (event.value !== '') values[index].date = event.value;
    setDateFields(values);
  };

  const handleSuggestionSelect = (index, event) => {
    const values = [...dateFields];

    if (event.target.name && event.target.name.includes('Stage')) {
      values[index].stage = event.suggestion;
    } else if (event.target.name && event.target.name.includes('Progress')) {
      values[index].progress = event.suggestion;
    }
    setDateFields(values);
  };

  const handleOtherInputChange = (index, event) => {
    const values = [...dateFields];

    if (event.target.name && event.target.name.includes('Stage')) {
      values[index].stage = event.target.value;
    } else if (event.target.name && event.target.name.includes('Progress')) {
      values[index].progress = event.target.value;
    }
    setDateFields(values);
  };

  // const selectOptions = ["Exploration", "Ideate", "Implement"];

  // const updateCreateOption = (text) => {
  //   const len = selectOptions.length;
  //   if (selectOptions[len - 1].includes("Create '")) {
  //     // remove Create option before adding an updated one
  //     selectOptions.pop();
  //   }
  //   selectOptions.push(`Create '${text}'`);
  // };

  // const getRegExp = text => {
  //   // The line below escapes regular expression special characters:
  //   // [ \ ^ $ . | ? * + ( )
  //   const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');

  //   // Create the regular expression with modified value which
  //   // handles escaping special characters. Without escaping special
  //   // characters, errors will appear in the console
  //   return new RegExp(escapedText, 'i');
  // };

  // const [options, setOptions] = useState(selectOptions);
  // const [searchValue, setSearchValue] = useState('');
  // const [selectValue, setSelectValue] = useState('');

  return (
    <Layer position="center" onEsc={onDone}>
      <Box>
        <Box pad={{ horizontal: 'large', vertical: 'small' }} width="large">
          <Header>
            <Heading level={2} size="small">
              {index >= 0 ? 'Edit Task' : 'Create a New Task'}
            </Heading>
            <Button icon={<Close />} onClick={onDone} />
          </Header>
          {auth ? (
            <Auth onChange={submit} />
          ) : (
            <Form value={value} onChange={setValue} onSubmit={() => submit()}>
              <FormField name="section" htmlFor="section" margin="none">
                <TextInput
                  icon={<FormDown />}
                  reverse
                  name="section"
                  id="section"
                  placeholder="Template"
                  suggestions={roadmap.sections}
                />
              </FormField>
              <FormField name="name" htmlFor="name" required>
                <TextInput name="name" id="name" placeholder="Title" />
              </FormField>
              <FormField
                name="note"
                htmlFor="note"
                margin={{ bottom: 'medium' }}
              >
                <TextArea name="note" id="note" placeholder="Notes" />
              </FormField>
              {linkFields.map((linkField, index) => (
                <Box direction="row" key={`${linkField}~${index}`}>
                  <FormField
                    fill="horizontal"
                    name={`${index}linkUrl`}
                    htmlFor={`${index}linkUrl`}
                  >
                    <TextInput
                      onChange={(event) => handleInputChange(index, event)}
                      name={`${index}linkUrl`}
                      id={`${index}linkUrl`}
                      placeholder="URL"
                    />
                  </FormField>
                  <Box
                    align="end"
                    width="40px"
                    margin={{ horizontal: 'small', vertical: 'xsmall' }}
                    border="all"
                    round="4px"
                  >
                    <Box align="center" pad="xsmall">
                      {linkField.linkUrl &&
                        (linkField.linkUrl.includes('figma.com') ? (
                          <Figma color="plain" />
                        ) : linkField.linkUrl.includes('github.com') ? (
                          <Github />
                        ) : (
                          <Link />
                        ))}
                    </Box>
                  </Box>
                  <Box alignContent="center">
                    <FormClose onClick={() => handleRemoveUrl(index)} />
                  </Box>
                </Box>
              ))}
              <Box align="center" onClick={() => handleAddUrl()}>
                <AddCircle color="border" />
              </Box>
              {dateFields.map((dateField, index) => (
                <Box
                  direction="row-responsive"
                  align="start"
                  justify="between"
                  gap="small"
                  key={`${dateField}~${index}`}
                  margin={{ bottom: 'small' }}
                >
                  <FormField
                    name={`${index}DateTarget`}
                    htmlFor={`${index}DateTarget`}
                    // name="target"
                    // htmlFor="target"
                    required
                    margin="none"
                  >
                    <DateInput
                      onChange={(event) => handleDateInputChange(index, event)}
                      name={`${index}DateTarget`}
                      htmlFor={`${index}DateTarget`}
                      // name="target"
                      // id="target"
                      format="mm/dd/yyyy"
                      placeholder="Date"
                    />
                  </FormField>
                  <FormField
                    name={`${index}DateStage`}
                    htmlFor={`${index}DateStage`}
                  >
                    <TextInput
                      onChange={(event) => handleOtherInputChange(index, event)}
                      onSuggestionSelect={(event) =>
                        handleSuggestionSelect(index, event)
                      }
                      name={`${index}DateStage`}
                      htmlFor={`${index}DateStage`}
                      icon={<FormDown />}
                      reverse
                      // name="label"
                      // id="label"
                      placeholder="Design Stage"
                      suggestions={roadmap.labels.map(({ name }) => name)}
                    />
                  </FormField>
                  <FormField
                    name={`${index}DateProgress`}
                    htmlFor={`${index}DateProgress`}
                    margin="none"
                  >
                    <TextInput
                      onChange={(event) => handleOtherInputChange(index, event)}
                      onSuggestionSelect={(event) =>
                        handleSuggestionSelect(index, event)
                      }
                      icon={<FormDown />}
                      reverse
                      name={`${index}DateProgress`}
                      htmlFor={`${index}DateProgress`}
                      // name="progress"
                      // id="progress"
                      placeholder="Progress"
                      suggestions={['Not Started', 'In Progress', 'Complete']}
                    />
                  </FormField>
                  <Box alignContent="center">
                    <FormClose onClick={() => handleRemoveDateField(index)} />
                  </Box>
                </Box>
              ))}
              <Box align="center" onClick={() => handleAddDateField()}>
                <AddCircle color="border" />
              </Box>

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
