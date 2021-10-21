import React, { FC, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as bip39 from 'bip39';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { WalletType } from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/pages/home/Auth/common/Button';
import { localMnemonic } from 'config/constants';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';
import { sleep } from 'utils/common';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

import { ErrorHint } from '../../../../../common/ErrorHint';

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

const MnemonicTextarea = styled.textarea`
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

type Props = {
  setIsLoading: (isLoading: boolean) => void;
  next: (mnemonic: string) => void;
};

export const Main: FC<Props> = ({ setIsLoading, next }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const trackEventOnce = useTrackEventOnce();
  const [mnemonic, setMnemonic] = useState(localMnemonic || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    trackEvent('login_open');
  }, []);

  const handleConnectByClick = (type: WalletType) => () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(type));
        unwrapResult(await dispatch(connectWallet()));

        if (type === WalletType.SOLLET) {
          trackEventOnce('login_solletio_click');
        } else if (type === WalletType.SOLLET_EXTENSION) {
          trackEventOnce('login_sollet_extension_click');
        } else if (type === WalletType.PHANTOM) {
          trackEventOnce('login_phantom_click');
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

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setMnemonic(value);
    validateMnemonic(value);

    trackEventOnce('login_seed_keydown');
  };

  const handleMnemonicPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const value = e.clipboardData.getData('text').trim();
    setMnemonic(value);
    validateMnemonic(value);

    trackEventOnce('login_seed_keydown');
  };

  const handleMnemonicBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
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
        <MnemonicTextarea
          placeholder="Seed phrase"
          value={mnemonic}
          onChange={handleMnemonicChange}
          onPaste={handleMnemonicPaste}
          onBlur={handleMnemonicBlur}
          className={classNames({ hasError })}
        />
        {hasError ? <ErrorHint error="Incorrect seed phrase" /> : undefined}
      </SecurityWrapper>
      <Button disabled={isDisabled} onClick={handleContinueClick}>
        Continue
      </Button>
    </Wrapper>
  );
};
