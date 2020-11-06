import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';

import { Header } from '../Header';

const Wrapper = styled.div``;

const Content = styled.div`
  padding: 0 20px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1004px;
  margin: 0 auto;
`;

type Props = {};

export const Layout: FunctionComponent<Props> = ({ children }) => {
  return (
    <Wrapper>
      <Header />
      <Content>
        <Container>{children}</Container>
      </Content>
    </Wrapper>
  );
};
