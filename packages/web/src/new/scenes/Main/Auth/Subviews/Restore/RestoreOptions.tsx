import type { FC } from 'react';
import { useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { PhantomWalletName } from '@solana/wallet-adapter-phantom';
import { SolletExtensionWalletName, SolletWalletName } from '@solana/wallet-adapter-sollet';
import * as bip39 from 'bip39';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import { observer } from 'mobx-react-lite';

import { ErrorHint } from 'components/common/ErrorHint';
import { ToastManager } from 'components/common/ToastManager';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthViewModel } from 'new/scenes/Main/Auth/Auth.ViewModel';

import { Button } from '../components/Button';
import { MnemonicTextarea as MnemonicInput } from '../Create/MnemonicInput';

const Wrapper = styled.div`
  margin-top: 32px;
`;

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
    background: url('../components/assets/sollet.svg') no-repeat 50%;
  }

  &.phantom {
    background: url('../components/assets/phantom.png') no-repeat 50%;
  }
`;

const ArrowIcon = styled.div`
  flex: 1;
  width: 20px;
  height: 20px;

  background: url('../components/assets/arrow-right.svg') no-repeat 100% 50%;
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

const MnemonicTextarea = styled(MnemonicInput)`
  height: 132px;
  &.hasError {
    border-color: #f43d3d;
  }
`;

const VALIDATE_MNEMONIC_THROTTLE_TIMEOUTE = 100;

export const RestoreOptions: FC = observer(() => {
  const viewModel = useViewModel(AuthViewModel);
  const [mnemonic, setMnemonic] = useState(viewModel.initialRestoreMnemonic);
  const [hasError, setHasError] = useState(false);
  const handleConnectByClick = (walletType: WalletName) => () => {
    viewModel.setIsLoading(true);
    try {
      void viewModel.connectExtension(walletType);
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      viewModel.setIsLoading(false);
    }
  };

  const validateMnemonic = throttle(
    (nextMnemonic) => {
      if (bip39.validateMnemonic(nextMnemonic)) {
        setHasError(false);
      } else if (!hasError) {
        setHasError(true);
      }
    },
    VALIDATE_MNEMONIC_THROTTLE_TIMEOUTE,
    { leading: false, trailing: true },
  );

  const handleMnemonicInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const valueTrimmed = value.trim();

    if (bip39.validateMnemonic(valueTrimmed)) {
      setMnemonic(valueTrimmed);
    } else {
      setMnemonic(value);
    }
    validateMnemonic(valueTrimmed);
  };

  const handleMnemonicBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setMnemonic(value);
    validateMnemonic(value);
  };

  const isDisabled = !mnemonic || hasError;

  const goNext = () => {
    viewModel.setMnemonic(mnemonic);
    viewModel.nextStep();
  };

  return (
    <Wrapper>
      <ButtonsWrapper>
        <SocialButton onClick={handleConnectByClick(SolletWalletName)}>
          <WalletIcon className="sollet" />
          Sollet.io
          <ArrowIcon />
        </SocialButton>
        <SocialButton onClick={handleConnectByClick(SolletExtensionWalletName)}>
          <WalletIcon className="sollet" />
          Sollet Extension
          <ArrowIcon />
        </SocialButton>
        <SocialButton onClick={handleConnectByClick(PhantomWalletName)}>
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
          onInput={handleMnemonicInput}
          onBlur={handleMnemonicBlur}
          className={classNames({ hasError })}
        />
        {hasError ? <ErrorHint error="Incorrect seed phrase" /> : undefined}
      </SecurityWrapper>
      <Button disabled={isDisabled} onClick={goNext}>
        Continue
      </Button>
    </Wrapper>
  );
});
