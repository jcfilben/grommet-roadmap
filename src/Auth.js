import React from 'react';
import { Box, Button, Form, TextInput } from 'grommet';
import { Next } from 'grommet-icons';

const Auth = ({ onChange }) => {
  return (
    <Box fill align="center" justify="center">
      <Form onSubmit={({ value: { password } }) => onChange(password)}>
        <Box direction="row" gap="medium">
          <TextInput
            size="large"
            name="password"
            placeholder="password"
            type="password"
          />
          <Button type="submit" icon={<Next />} hoverIndicator />
        </Box>
      </Form>
    </Box>
  );
};

export default Auth;
