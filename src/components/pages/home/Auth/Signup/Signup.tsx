import React, { FC, useMemo, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import * as bip39 from 'bip39';

import { WalletType } from 'api/wallet';
import { DERIVATION_PATH, mnemonicToSeed, storeMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ToastManager } from 'components/common/ToastManager';
import { Password } from 'components/pages/home/Auth/Signup/Password';
import { connectWallet, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

import { Back } from '../common/Back';
import { DataType } from '../types';
import { Seed } from './Seed';

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

type PageTypes = 'seed' | 'password';

const backToPage: {
  [page in PageTypes]: PageTypes;
} = {
  seed: 'seed',
  password: 'seed',
};

type Props = {
  setIsLoading: (isLoading: boolean) => void;
  next: (data: DataType) => void;
};

export const Signup: FC<Props> = ({ setIsLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [page, setPage] = useState<PageTypes>('seed');

  const mnemonic = useMemo(() => bip39.generateMnemonic(256), []);

  const handleBackClick = () => {
    setPage((state) => backToPage[state]);
  };

  const handleContinueSeedClick = () => {
    setPage('password');
  };

  const handleFinishPasswordClick = (password: string) => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        const seed = await mnemonicToSeed(mnemonic);
        await dispatch(
          connectWallet({ seed, password, derivationPath: DERIVATION_PATH.bip44Change }),
        );
        await storeMnemonicAndSeed(mnemonic, seed, DERIVATION_PATH.bip44Change, password);
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

  return (
    <Wrapper>
      <Title>
        {page !== 'seed' ? <BackStyled onClick={handleBackClick} /> : undefined}
        New wallet
      </Title>
      {page === 'seed' ? <Seed seed={mnemonic} next={handleContinueSeedClick} /> : undefined}
      {page === 'password' ? <Password finish={handleFinishPasswordClick} /> : undefined}
    </Wrapper>
  );
};
