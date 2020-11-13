import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';
import { Header } from '../components/common/Header';
import { Button } from 'components/ui';

const Wrapper = styled.div``;

const Box = styled.div`
  margin: auto;
  max-width: 364px;
`;

const Actions = styled.div`
  display: flex;
  flex-flow: column wrap;
`;

const CreateButton = styled(Button)`
  width: 100%;
  height: 56px;
  font-weight: 500;
  color: #fff;
  background: #000; 
  line-height: 17px;
  margin-bottom: 20px;
  size: 14px;
  font-style: normal;
`;

const AccessButton = styled(Button)`
  width: 100%;
  height: 56px;
  color: #000;
  font-weight: 500;
  background: #F3F3F3; 
  line-height: 17px;
  font-style: normal;
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
  background-image: url('p2p-wallet-web/images/sun.png');
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
          <Link to="/create">
            <CreateButton primary>Create Wallet</CreateButton>
          </Link>
          <Link to="/access">
            <AccessButton primary>Access Wallet</AccessButton>
          </Link>
        </Actions>
      </Box>
    </Wrapper>
  );
};
