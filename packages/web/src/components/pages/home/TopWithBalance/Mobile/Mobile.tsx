import type { FC } from 'react';

import { styled } from '@linaria/react';

import { TotalBalance } from '../common/TotalBalance';

const Wrapper = styled.div`
  padding: 16px 0 8px;
`;

interface Props {}

export const Mobile: FC<Props> = () => {
  return (
    <Wrapper>
      <TotalBalance />
    </Wrapper>
  );
};
