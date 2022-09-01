import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;

  color: #f43d3d;
  font-weight: 600;
  font-size: 16px;
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
  noIcon?: boolean;
}

export const ErrorHint: FC<Props> = ({ error, noIcon }) => {
  return (
    <Wrapper>
      {!noIcon ? <WarningIcon name="warning" /> : undefined}
      {error}
    </Wrapper>
  );
};
