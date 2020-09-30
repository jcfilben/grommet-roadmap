import React from 'react';
import { Box } from 'grommet';
import { Checkmark } from 'grommet-icons';

const Status = ({ active, value }) => {
  let icon = null;
  if (value === 'done')
    icon = (
      <Box
        flex={false}
        pad={active !== undefined ? 'xsmall' : undefined}
        background={active ? 'selected-background' : undefined}
        round="xsmall"
      >
        <Checkmark color="status-ok" />
      </Box>
    );
  return icon;
};

export default Status;
