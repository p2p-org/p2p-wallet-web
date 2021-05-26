import React, { FC, useEffect, useState } from 'react';

import { styled } from '@linaria/react';

import { mnemonicToSeed, STORAGE_KEY_LOCKED } from 'api/wallet/ManualWallet';
import { Back } from 'components/pages/home/Auth/common/Back';
import { DerivableAccounts } from 'components/pages/home/Auth/Login/DerivableAccounts';
import { Password } from 'components/pages/home/Auth/Login/Password';

import { DataType } from '../types';
import { Main } from './Main';
import { Restore } from './Restore';

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

type PageTypes = 'restore' | 'main' | 'password' | 'derivableAccounts';

const backToPage: {
  [page in PageTypes]: PageTypes;
} = {
  restore: 'main',
  main: 'main',
  password: 'main',
  derivableAccounts: 'password',
};

type Props = {
  setIsLoading: (isLoading: boolean) => void;
  next: (data: DataType) => void;
};

export const Login: FC<Props> = ({ setIsLoading, next }) => {
  const [mnemonic, setMnemonic] = useState('');
  const [seed, setSeed] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState<PageTypes | 'ready'>('main');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY_LOCKED)) {
      setPage('restore');
    }
  }, []);

  const handleBackClick = () => {
    setPage((state) => backToPage[state as PageTypes]);
  };

  const handleContinueMnemonicClick = async (nextMnemonic: string) => {
    const nextSeed = await mnemonicToSeed(nextMnemonic);

    setMnemonic(nextMnemonic);
    setSeed(nextSeed);
    setPage('password');
  };

  const handleContinuePasswordClick = (nextPassword: string) => {
    setPassword(nextPassword);
    setPage('derivableAccounts');
  };

  const handleContinueDerivableAccountsClick = (nextDerivationPath: string) => {
    next({
      type: 'login',
      mnemonic,
      seed,
      password,
      derivationPath: nextDerivationPath,
    });
  };

  const render = () => {
    if (page === 'restore') {
      return <Restore setIsLoading={setIsLoading} back={handleBackClick} />;
    }

    return (
      <>
        <Title>
          {page !== 'main' ? <BackStyled onClick={handleBackClick} /> : undefined}
          Log in to your wallet
        </Title>
        {page === 'main' ? (
          <Main setIsLoading={setIsLoading} next={handleContinueMnemonicClick} />
        ) : undefined}
        {page === 'password' ? <Password next={handleContinuePasswordClick} /> : undefined}
        {page === 'derivableAccounts' ? (
          <DerivableAccounts seed={seed} next={handleContinueDerivableAccountsClick} />
        ) : undefined}
      </>
    );
  };

  return <Wrapper>{render()}</Wrapper>;
};
