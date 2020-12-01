import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { styled } from 'linaria/react';

import { Button } from 'components/ui';
import { connect } from 'features/wallet/WalletSlice';

import { Header } from '../components/common/Header';

const Wrapper = styled.div`
  height: auto !important;
  min-height: 100%;

  background: #fff;
`;

const Box = styled.div`
  max-width: 364px;
  margin: auto;
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
  margin-bottom: 28px;

  color: #000;
  font-weight: 500;
  font-size: 27px;
  line-height: 120%;
  text-align: center;
`;

const HeaderImage = styled.div`
  width: 219px;
  height: 209px;
  margin: 91px auto 48px;

  background-image: url('images/sun.png');
`;

export const Home: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleConnectBySolletClick = async () => {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await dispatch(connect());

    setTimeout(() => {
      history.push('/wallets');
    }, 100);
  };

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
          <Button gray big full onClick={handleConnectBySolletClick}>
            Connect by Sollet
          </Button>
        </Actions>
      </Box>
    </Wrapper>
  );
};
