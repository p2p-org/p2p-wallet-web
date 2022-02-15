import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { DERIVATION_PATH, mnemonicToSeed } from '@p2p-wallet-web/core';
import * as bip39 from 'bip39';

import { Password } from 'components/pages/auth/AuthSide/common/Password';
import { Paste } from 'components/pages/auth/AuthSide/Signup/Paste';
import { trackEvent } from 'utils/analytics';

import { Back } from '../common/Back';
import type { DataType } from '../types';
import { Mnemonic } from './Mnemonic';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 360px;
`;

const Title = styled.span`
  position: relative;

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

type PageTypes = 'mnemonic' | 'paste' | 'password';

const backToPage: {
  // eslint-disable-next-line no-unused-vars
  [page in PageTypes]: PageTypes;
} = {
  mnemonic: 'mnemonic',
  paste: 'mnemonic',
  password: 'paste',
};

type Props = {
  next: (data: DataType) => void;
};

export const Signup: FC<Props> = ({ next }) => {
  const [page, setPage] = useState<PageTypes>('mnemonic');

  const mnemonic = useMemo(() => bip39.generateMnemonic(256), []);

  useEffect(() => {
    trackEvent('signup_open');
  }, []);

  const handleBackClick = () => {
    setPage((state) => backToPage[state]);
  };

  const handleContinueMnemonicClick = () => {
    setPage('paste');
  };

  const handleContinuePasteClick = () => {
    setPage('password');
  };

  const handleContinuePasswordClick = async (password: string) => {
    const seed = await mnemonicToSeed(mnemonic);
    next({
      type: 'signup',
      mnemonic,
      seed,
      password,
      derivationPath: DERIVATION_PATH.Bip44Change,
    });
  };

  return (
    <Wrapper>
      <Title>
        {page !== 'mnemonic' ? <BackStyled onClick={handleBackClick} /> : undefined}
        New wallet
      </Title>
      {page === 'mnemonic' ? (
        <Mnemonic mnemonic={mnemonic} next={handleContinueMnemonicClick} />
      ) : undefined}
      {page === 'paste' ? <Paste mnemonic={mnemonic} next={handleContinuePasteClick} /> : undefined}
      {page === 'password' ? (
        <Password type="signup" next={handleContinuePasswordClick} />
      ) : undefined}
    </Wrapper>
  );
};
