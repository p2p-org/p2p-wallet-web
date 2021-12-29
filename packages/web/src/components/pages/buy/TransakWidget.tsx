import type { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;

  padding: 16px 24px;
`;

export const TransakWidget: FC = () => {
  return <Wrapper></Wrapper>;
};
