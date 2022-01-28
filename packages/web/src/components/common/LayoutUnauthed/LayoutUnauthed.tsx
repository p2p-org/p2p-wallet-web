import type { FC } from 'react';

import { styled } from '@linaria/react';

import { Header } from 'components/common/Layout/DesktopLayout/Header';

const Wrapper = styled.div`
  display: flex;

  height: 100%;

  background: #fff;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;

  width: 364px;
  margin: auto;
`;

export const LayoutUnauthed: FC = ({ children }) => {
  return (
    <Wrapper>
      <Header />
      <Box>{children}</Box>
    </Wrapper>
  );
};
