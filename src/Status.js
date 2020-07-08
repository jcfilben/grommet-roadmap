import React from 'react';
import { Box } from 'grommet';
import { Checkmark, Close, Launch } from 'grommet-icons';

const Status = ({ active, value }) => {
  let icon = null;
  if (value === 'done')
    icon = <Checkmark color={active === undefined ? 'status-ok' : undefined} />;
  else if (value === 'ready')
    icon = <Launch color={active === undefined ? 'text-weak' : undefined} />;
  else if (value === 'in progress')
    icon = (
      <Box animation="pulse">
        <Launch style={{ transform: 'rotate(90deg)' }} />
      </Box>
    );
  else if (value === 'none') icon = <Close size="small" />;
  if (icon) {
    icon = (
      <Box
        flex={false}
        pad={active !== undefined ? 'xsmall' : undefined}
        background={active ? 'selected-background' : undefined}
        round="xsmall"
      >
        {icon}
      </Box>
    );
  }
  return icon;
};

export default Status;
