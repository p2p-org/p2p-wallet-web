import React, { FC } from 'react';

import { styled } from '@linaria/react';

import { Header } from 'components/common/Header';

const Wrapper = styled.div`
  height: 100%;

  background: #fff;
`;

const Box = styled.div`
  max-width: 364px;
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
