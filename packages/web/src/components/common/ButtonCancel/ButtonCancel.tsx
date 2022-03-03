import type { FC } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';

import { Button, Icon } from 'components/ui';

const CancelIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonCancel: FC<Props> = (props) => {
  return (
    <Button {...props} hollow error>
      <CancelIcon name="cross" />
      Cancel
    </Button>
  );
};
