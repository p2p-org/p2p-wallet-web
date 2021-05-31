import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;

  color: #f43d3d;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const WarningIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 12px;

  color: #f43d3d;
`;

interface Props {
  error: string;
}

export const ErrorHint: FC<Props> = ({ error }) => {
  return (
    <Wrapper>
      <WarningIcon name="warning" />
      {error}
    </Wrapper>
  );
};
