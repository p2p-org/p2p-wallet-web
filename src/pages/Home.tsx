import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';

import { Button } from 'components/ui';

import { Header } from '../components/common/Header';

const Wrapper = styled.div``;

const Box = styled.div`
  margin: auto;
  max-width: 364px;
`;

const Actions = styled.div`
  display: flex;
  flex-flow: column wrap;

  > :not(:last-child) {
    margin-bottom: 20px;
  }
`;

const Title = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
  text-align: center;
`;

const SubTitle = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
  text-align: center;
  margin-bottom: 28px;
`;

const HeaderImage = styled.div`
  background-image: url('images/sun.png');
  height: 209px;
  width: 219px;
  margin: auto;
  margin-top: 91px;
  margin-bottom: 48px;
`;

export const Home: FunctionComponent = () => {
  return (
    <Wrapper>
      <Header />
      <Box>
        <HeaderImage />
        <Title>P2P Wallet </Title>
        <SubTitle> Own Your Money </SubTitle>
        <Actions>
          <Button primary big full as={Link} to="/create">
            Create new wallet
          </Button>
          <Button gray big full as={Link} to="/access">
            I already have a wallet
          </Button>
        </Actions>
      </Box>
    </Wrapper>
  );
};
