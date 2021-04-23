import React, { FC, useMemo, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import * as bip39 from 'bip39';

import { WalletType } from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { Password } from 'components/pages/home/Signup/Password';
import { connect, selectType } from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

import { Seed } from './Seed';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 360px;
`;

const Title = styled.span`
  color: #161616;
  font-weight: 700;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
  text-align: center;
`;

type Props = {
  setIsLoading: (isLoading: boolean) => void;
};

export const Signup: FC<Props> = ({ setIsLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [page, setPage] = useState('password');
  const [password, setPassword] = useState('');

  const mnemonic = useMemo(() => bip39.generateMnemonic(), []);

  const handleContinueClick = (currentPassword: string) => {
    setPassword(currentPassword);
    setPage('seed');
  };

  const handleFinishClick = () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        await dispatch(connect({ mnemonic, password }));
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
      <Title>New wallet</Title>
      {page === 'password' ? <Password next={handleContinueClick} /> : undefined}
      {page === 'seed' ? <Seed seed={mnemonic} finish={handleFinishClick} /> : undefined}
    </Wrapper>
  );
};
