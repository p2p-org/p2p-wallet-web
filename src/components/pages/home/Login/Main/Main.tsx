import React, { FC, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as bip39 from 'bip39';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { WalletType } from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/pages/home/common/Button';
import { Icon } from 'components/ui';
import { localMnemonic } from 'config/constants';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

const Wrapper = styled.div``;

const ButtonsWrapper = styled.div``;

const SocialButton = styled.button`
  display: flex;
  align-items: center;

  width: 100%;
  height: 54px;
  padding: 0 16px 0 24px;

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
  margin-right: 16px;

  &.sollet {
    background: url('./sollet.svg') no-repeat 50%;
  }

  &.phantom {
    background: url('./phantom.png') no-repeat 50%;
  }
`;

const ArrowIcon = styled.div`
  flex: 1;
  width: 20px;
  height: 20px;

  background: url('./arrow-right.svg') no-repeat 100% 50%;
  opacity: 0.15;
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

const SecurityWrapper = styled.div`
  display: flex;
  flex-direction: column;

  margin-bottom: 32px;
`;

const SecurityKey = styled.span`
  margin-bottom: 8px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SeedTextarea = styled.textarea`
  min-height: 92px;
  padding: 15px;

  color: #161616;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 22px;

  background: #f6f6f8;
  border: 1px solid transparent;
  border-radius: 12px;

  &.hasError {
    border-color: #f43d3d;
  }

  &::placeholder {
    color: #1616164c;
  }
`;

const Error = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;

  color: #f43d3d;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const WarningIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  margin-right: 12px;

  color: #f43d3d;
`;

type Props = {
  setIsLoading: (isLoading: boolean) => void;
  next: (mnemonic: string) => void;
};

export const Main: FC<Props> = ({ setIsLoading, next }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [mnemonic, setMnemonic] = useState(localMnemonic || '');
  const [hasError, setHasError] = useState(false);

  const handleConnectByClick = (type: WalletType) => () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(type));
        unwrapResult(await dispatch(connectWallet()));
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

  const validateMnemonic = throttle(
    (nextMnemonic) => {
      if (bip39.validateMnemonic(nextMnemonic)) {
        setHasError(false);
      } else if (!hasError) {
        setHasError(true);
      }
    },
    100,
    { leading: false, trailing: true },
  );

  const handleSeedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setMnemonic(value);
    validateMnemonic(value);
  };

  const handleContinueClick = () => {
    next(mnemonic);
  };

  const isDisabled = !mnemonic || hasError;

  return (
    <Wrapper>
      <ButtonsWrapper>
        <SocialButton onClick={handleConnectByClick(WalletType.SOLLET)}>
          <WalletIcon className="sollet" />
          Sollet.io
          <ArrowIcon />
        </SocialButton>
        <SocialButton onClick={handleConnectByClick(WalletType.SOLLET_EXTENSION)}>
          <WalletIcon className="sollet" />
          Sollet Extension
          <ArrowIcon />
        </SocialButton>
        <SocialButton onClick={handleConnectByClick(WalletType.PHANTOM)}>
          <WalletIcon className="phantom" />
          Phantom
          <ArrowIcon />
        </SocialButton>
      </ButtonsWrapper>
      <Delimiter>
        <DelimiterText>Or use your seed...</DelimiterText>
      </Delimiter>
      <SecurityWrapper>
        <SecurityKey>Enter security key</SecurityKey>
        <SeedTextarea
          placeholder="Seed phrase"
          value={mnemonic}
          onChange={handleSeedChange}
          className={classNames({ hasError })}
        />
        {hasError ? (
          <Error>
            <WarningIcon name="warning" />
            Incorrect seed phrase
          </Error>
        ) : undefined}
      </SecurityWrapper>
      <Button disabled={isDisabled} onClick={handleContinueClick}>
        Continue
      </Button>
    </Wrapper>
  );
};
