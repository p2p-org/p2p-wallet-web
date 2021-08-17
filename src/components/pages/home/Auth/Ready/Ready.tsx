import React, { FC, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { WalletType } from 'api/wallet';
import { storeMnemonicAndSeed } from 'api/wallet/ManualWallet';
import LogoImg from 'assets/images/big-logo.png';
import { ToastManager } from 'components/common/ToastManager';
import { DataType } from 'components/pages/home/Auth/types';
import { Switch } from 'components/ui';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';
import { sleep } from 'utils/common';

import { Button } from '../common/Button';
import { OffPasswordModal } from './OffPasswordModal';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 360px;
  margin-top: 200px;
`;

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;

  background: url('${LogoImg}') no-repeat 50% 50%;
  background-size: 64px 64px;
`;

const Title = styled.span`
  display: inline-block;
  margin-top: 32px;

  color: #161616;
  font-weight: bold;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
`;

const Desc = styled.span`
  margin-top: 8px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
  text-align: center;
`;

const SwitcherLabel = styled.label`
  display: flex;
  align-items: center;

  height: 52px;
  margin: 20px 0 32px;
  padding: 0 20px;

  background: #f6f6f8;
  border-radius: 12px;

  cursor: pointer;
`;

const SwitcherText = styled.span`
  margin-left: 20px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

interface Props {
  setIsLoading: (isLoading: boolean) => void;
  data: DataType;
}

export const Ready: FC<Props> = ({ setIsLoading, data }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isSave, setIsSave] = useState(true);
  const [isShowModal, setIsShowModal] = useState(false);

  useEffect(() => {
    if (data.type === 'login') {
      trackEvent('login_wallet_ready_open');
    } else if (data.type === 'signup') {
      trackEvent('signup_wallet_ready_open');
    }
  }, [data.type]);

  const handleCloseModal = (nextIsSave: boolean) => {
    setIsShowModal(false);
    setIsSave(nextIsSave);
  };

  const handleIsSaveChange = (nextIsSave: boolean) => {
    if (nextIsSave) {
      setIsSave(nextIsSave);
      return;
    }

    setIsShowModal(true);
  };

  const handleFinishClick = () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        unwrapResult(
          await dispatch(
            connectWallet({
              seed: data.seed,
              password: data.password,
              derivationPath: data.derivationPath,
            }),
          ),
        );
        await storeMnemonicAndSeed(
          data.mnemonic,
          data.seed,
          data.derivationPath,
          data.password,
          isSave,
        );

        if (data.type === 'login') {
          trackEvent('login_finish_setup_click', { fastEnter: isSave });
        } else if (data.type === 'signup') {
          trackEvent('signup_finish_setup_click', { fastEnter: isSave });
        }

        await sleep(100);
        history.push('/wallets');
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Wrapper>
      {isShowModal ? <OffPasswordModal close={handleCloseModal} /> : undefined}

      <TopWrapper>
        <Logo />
        <Title>{data.type === 'login' ? 'Welcome back!' : 'Your wallet is ready!'}</Title>
        <Desc>
          You can turn on a quick enter via password. Only you have access to your keys, not
          government, not us, not anyone else. it’s 100% stored on your devices.
        </Desc>
      </TopWrapper>
      <SwitcherLabel>
        <Switch checked={isSave} onChange={handleIsSaveChange} />
        <SwitcherText>Use fast enter with password</SwitcherText>
      </SwitcherLabel>
      <Button onClick={handleFinishClick}>Finish setup</Button>
    </Wrapper>
  );
};
