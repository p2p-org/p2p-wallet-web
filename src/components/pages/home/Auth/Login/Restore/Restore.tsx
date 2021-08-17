import React, { FC, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { WalletType } from 'api/wallet';
import { loadMnemonicAndSeed, LockedType, STORAGE_KEY_LOCKED } from 'api/wallet/ManualWallet';
import { ERROR_WRONG_PASSWORD } from 'api/wallet/ManualWallet/errors';
import LogoImg from 'assets/images/big-logo.png';
import { ErrorHint } from 'components/common/ErrorHint';
import { PasswordInput } from 'components/common/PasswordInput';
import { ToastManager } from 'components/common/ToastManager';
import { SelectorAccountItem } from 'components/pages/home/Auth/Login/Restore/SelectorAccountItem';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';
import { sleep } from 'utils/common';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

import { Button } from '../../common/Button';
import { Selector } from '../../common/Selector';
import { SelectorItemType } from '../../common/Selector/Selector';

const Wrapper = styled.div``;

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

const AccountWrapper = styled.div`
  margin: 32px 0;
`;

const EnterPassword = styled.span`
  display: inline-block;
  margin: 32px 0 8px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const ButtonsWrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 12px;
  }
`;

interface Props {
  setIsLoading: (isLoading: boolean) => void;
  back: () => void;
}

export const Restore: FC<Props> = ({ setIsLoading, back }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const trackEventOnce = useTrackEventOnce();
  const [password, setPassword] = useState('');
  const [accounts, setAccounts] = useState<SelectorItemType[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    trackEvent('restore_welcome_back_open');

    if (localStorage.getItem(STORAGE_KEY_LOCKED)) {
      const locked = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCKED) || '') as LockedType;

      setAccounts([
        {
          label: <SelectorAccountItem account={locked.account} />,
          value: locked.account,
        },
      ]);
    }
  }, []);

  const validatePassword = async (value: string) => {
    try {
      await loadMnemonicAndSeed(value);
      setHasError(false);
    } catch (error) {
      if ((error as Error).message === ERROR_WRONG_PASSWORD) {
        setHasError(true);
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (value) {
      trackEventOnce('restore_password_keydown');
      void validatePassword(value);
    }
  };

  const handleAccessClick = () => {
    batch(async () => {
      try {
        const { seed, derivationPath } = await loadMnemonicAndSeed(password);

        if (seed && derivationPath) {
          setIsLoading(true);
          dispatch(selectType(WalletType.MANUAL));
          unwrapResult(
            await dispatch(
              connectWallet({
                seed,
                password,
                derivationPath,
              }),
            ),
          );

          trackEvent('restore_access_wallet_click');

          await sleep(100);
          history.push('/wallets');
        } else {
          throw new Error(`Can't restore wallet`);
        }
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSeedPhraseClick = () => {
    trackEvent('restore_access_via_seed_click');
    back();
  };

  const isDisabled = !password || hasError;

  return (
    <Wrapper>
      <TopWrapper>
        <Logo />
        <Title>Welcome back!</Title>
      </TopWrapper>
      <AccountWrapper>
        <Selector value={accounts[0]} items={accounts} onChange={() => console.log(1)} />
        <EnterPassword>Enter password</EnterPassword>
        <PasswordInput placeholder="Password" value={password} onChange={handlePasswordChange} />
        {hasError ? <ErrorHint error="Wrong password" /> : undefined}
      </AccountWrapper>
      <ButtonsWrapper>
        <Button disabled={isDisabled} onClick={handleAccessClick}>
          Access my wallet
        </Button>
        <Button className="hollow" onClick={handleSeedPhraseClick}>
          Access via seed phrase
        </Button>
      </ButtonsWrapper>
    </Wrapper>
  );
};
