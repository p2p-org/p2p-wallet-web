import React, { FC, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { WalletType } from 'api/wallet';
import { loadMnemonicAndSeed, mnemonicToSeed, STORAGE_KEY_LOCKED } from 'api/wallet/ManualWallet';
import { ToastManager } from 'components/common/ToastManager';
import { Back } from 'components/pages/home/common/Back';
import { DerivableAccounts } from 'components/pages/home/Login/DerivableAccounts';
import { Password } from 'components/pages/home/Login/Password';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

import { Main } from './Main';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 360px;
`;

const Title = styled.span`
  position: relative;

  margin-bottom: 32px;

  color: #161616;
  font-weight: 700;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
  text-align: center;
`;

const BackStyled = styled(Back)`
  position: absolute;
  left: 0;
`;

type PageTypes = 'main' | 'password' | 'derivableAccounts';

const backToPage: {
  [page in PageTypes]: PageTypes;
} = {
  main: 'main',
  password: 'main',
  derivableAccounts: 'password',
};

type Props = {
  setIsLoading: (isLoading: boolean) => void;
};

export const Login: FC<Props> = ({ setIsLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [mnemonic, setMnemonic] = useState('');
  const [seed, setSeed] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState<PageTypes>('main');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY_LOCKED)) {
      setPage('password');
    }
  }, []);

  const handleContinueMnemonicClick = async (nextMnemonic: string) => {
    const nextSeed = await mnemonicToSeed(nextMnemonic);

    setMnemonic(nextMnemonic);
    setSeed(nextSeed);
    setPage('password');
  };

  const handleContinuePasswordClick = async (nextPassword: string) => {
    // If has locked and has not mnemonic from prev step
    if (mnemonic || !localStorage.getItem(STORAGE_KEY_LOCKED)) {
      setPassword(nextPassword);
      setPage('derivableAccounts');

      return;
    }

    // If has not locked
    try {
      const { seed: loadedSeed, derivationPath } = await loadMnemonicAndSeed(nextPassword);
      if (loadedSeed && derivationPath) {
        batch(async () => {
          try {
            setIsLoading(true);
            dispatch(selectType(WalletType.MANUAL));
            unwrapResult(
              await dispatch(
                connectWallet({ seed: loadedSeed, password: nextPassword, derivationPath }),
              ),
            );
            await sleep(100);
            history.push('/wallets');
            // eslint-disable-next-line @typescript-eslint/no-shadow
          } catch (error) {
            ToastManager.error((error as Error).message);
          } finally {
            setIsLoading(false);
          }
        });
      }
    } catch (error) {
      ToastManager.error((error as Error).message);
    }
  };

  const handleBackClick = () => {
    setPage((state) => backToPage[state]);
  };

  return (
    <Wrapper>
      <Title>
        {page !== 'main' ? <BackStyled onClick={handleBackClick} /> : undefined}
        Log in to your wallet
      </Title>
      {page === 'main' ? (
        <Main setIsLoading={setIsLoading} next={handleContinueMnemonicClick} />
      ) : undefined}
      {page === 'password' ? <Password next={handleContinuePasswordClick} /> : undefined}
      {page === 'derivableAccounts' ? (
        <DerivableAccounts
          mnemonic={mnemonic}
          seed={seed}
          password={password}
          setIsLoading={setIsLoading}
        />
      ) : undefined}
    </Wrapper>
  );
};
