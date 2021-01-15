import React, { FunctionComponent } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import bgImg from 'assets/images/sun.png';

import { WalletType } from 'api/wallet';
import { Button } from 'components/ui';
import { connect, selectType } from 'store/slices/wallet/WalletSlice';

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

  background-image: url(${bgImg});
`;

export const Home: FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleConnectByClick = (type: WalletType) => {
    batch(async () => {
      dispatch(selectType(type));
      await dispatch(connect());

      setTimeout(() => {
        history.push('/wallets');
      }, 100);
    });
  };

  return (
    <Wrapper>
      <Header />
      <Box>
        <HeaderImage />
        <Title>P2P Wallet </Title>
        <SubTitle> Own Your Money </SubTitle>
        <Actions>
          <Link to="/create" className="button">
            <Button primary big full>
              Create new wallet
            </Button>
          </Link>
          <Link to="/access" className="button">
            <Button gray big full>
              I already have a wallet
            </Button>
          </Link>
          <Button gray big full onClick={() => handleConnectByClick(WalletType.SOLLET)}>
            Connect by Sollet
          </Button>
          <Button gray big full onClick={() => handleConnectByClick(WalletType.BONFIDA)}>
            Connect by Bonfida
          </Button>
        </Actions>
      </Box>
    </Wrapper>
  );
};
