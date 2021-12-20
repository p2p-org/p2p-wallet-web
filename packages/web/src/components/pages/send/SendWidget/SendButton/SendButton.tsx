import type { FC } from 'react';
import React from 'react';

import { styled } from '@linaria/react';

import { Button } from 'components/ui';

const Wrapper = styled.div``;

interface Props {
  primary: boolean;
  disabled: boolean;
}

export const SendButton: FC<Props> = ({ primary, disabled }) => {
  return (
    <Button primary={primary} disabled={disabled} big full onClick={handleSubmit}>
      <SendIcon name="top" />
      Send now
    </Button>
  );
};
