import React, { FunctionComponent, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { WalletType } from 'api/wallet';
import logo from 'assets/images/logo-blue.png';
import bgImg from 'assets/images/sun.png';
import { HEADER_HEIGHT } from 'components/common/Header/constants';
import { LayoutUnauthed } from 'components/common/LayoutUnauthed';
import { Loader } from 'components/common/Loader';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import {
  autoConnect,
  connect,
  selectType,
  STORAGE_KEY_SEED,
} from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

const LoaderPage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100%;
`;

const LoaderWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: -${HEADER_HEIGHT}px;
`;

const LoaderStyled = styled(Loader)`
  width: 64px;
  height: 64px;

  &::after {
    width: 88%;
    height: 88%;
  }
`;

const LogoImg = styled.img`
  position: absolute;

  width: 44px;
  height: 44px;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const mount = async () => {
      if (!localStorage.getItem(STORAGE_KEY_SEED)) {
        return;
      }

      try {
        setIsLoading(true);
        unwrapResult(await dispatch(autoConnect()));
        await sleep(100);
        history.push('/wallets');
      } catch (error) {
        ToastManager.error(String(error));
      } finally {
        setIsLoading(false);
      }
    };

    void mount();
  }, []);

  const handleConnectByClick = (type: WalletType) => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(type));
        unwrapResult(await dispatch(connect()));
        await sleep(100);
        history.push('/wallets');
      } catch (error) {
        ToastManager.error(String(error));
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <LayoutUnauthed>
      {isLoading ? (
        <LoaderPage>
          <LoaderWrapper>
            <LoaderStyled />
            <LogoImg src={logo as string} />
          </LoaderWrapper>
        </LoaderPage>
      ) : (
        <>
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
        </>
      )}
    </LayoutUnauthed>
  );
};
