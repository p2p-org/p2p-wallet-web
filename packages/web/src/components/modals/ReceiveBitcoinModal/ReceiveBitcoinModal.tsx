import type { FC } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

type UseSOLAccount = () => TokenAccount;

const useSolAccount: UseSOLAccount = () => {
  const userAccounts = useUserTokenAccounts();

  return userAccounts.find((account) => account.balance?.token?.isRawSOL) as TokenAccount;
};

const ACCOUNT_CREATION_AMOUNT = 0.00203928;

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const solAccount = useSolAccount();
  const isEnoughSol = (solAccount?.balance?.asNumber ?? 0) >= ACCOUNT_CREATION_AMOUNT;

  if (isEnoughSol) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
