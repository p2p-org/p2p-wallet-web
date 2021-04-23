import React, { FC, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as bip39 from 'bip39';

import { WalletType } from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/pages/home/common/Button';
import { connect, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 360px;
`;

const Title = styled.span`
  margin-bottom: 32px;

  color: #161616;
  font-weight: 700;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
  text-align: center;
`;

const ButtonsWrapper = styled.div``;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 54px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;

  background: #fff;
  border: 1px solid rgba(22, 22, 22, 0.15);
  border-radius: 32px;
  outline: none;
  cursor: pointer;

  appearance: none;

  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

const WalletIcon = styled.div`
  width: 30px;
  height: 30px;
  margin-right: 12px;

  &.sollet {
    background: url('./sollet.svg') no-repeat 50%;
  }

  &.bonfida {
    background: url('./bonfida.svg') no-repeat 50%;
  }
`;

const Delimiter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  margin: 32px 0;

  &::before {
    position: absolute;

    width: 100%;
    height: 1px;

    background: #161616;
    opacity: 0.15;

    content: '';
  }
`;

const DelimiterText = styled.div`
  z-index: 1;

  padding: 0 10px;

  color: #161616;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 20px;

  background: #fff;
`;

const SecurityKey = styled.span`
  margin-bottom: 12px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SeedTextarea = styled.textarea`
  min-height: 92px;
  margin-bottom: 24px;
  padding: 15px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 22px;

  background: #f6f6f8;
  border: none;
  border-radius: 12px;

  &::placeholder {
    color: #1616164c;
  }
`;

type Props = {
  setIsLoading: (isLoading: boolean) => void;
};

export const Login: FC<Props> = ({ setIsLoading }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState(false);

  // TODO: password process
  const password = '';

  const handleSeedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setMnemonic(value);

    if (bip39.validateMnemonic(value)) {
      setError(false);
    } else if (!error) {
      setError(true);
    }
  };

  const handleConnectByClick = (type: WalletType) => () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(type));
        unwrapResult(await dispatch(connect()));
        await sleep(100);
        history.push('/wallets');
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleContinueClick = () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        unwrapResult(await dispatch(connect({ mnemonic, password })));
        await sleep(100);
        history.push('/wallets');
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const isDisabled = !mnemonic || error;

  return (
    <Wrapper>
      <Title>Log in to your wallet</Title>
      <ButtonsWrapper>
        <SocialButton onClick={handleConnectByClick(WalletType.SOLLET)}>
          <WalletIcon className="sollet" />
          Continue with Sollet
        </SocialButton>
        <SocialButton onClick={handleConnectByClick(WalletType.BONFIDA)}>
          <WalletIcon className="bonfida" />
          Continue with Bonfida
        </SocialButton>
      </ButtonsWrapper>
      <Delimiter>
        <DelimiterText>Or use your seed...</DelimiterText>
      </Delimiter>
      <SecurityKey>Enter security key</SecurityKey>
      <SeedTextarea placeholder="Seed phrase" value={mnemonic} onChange={handleSeedChange} />
      <Button disabled={isDisabled} onClick={handleContinueClick}>
        Continue
      </Button>
    </Wrapper>
  );
};
