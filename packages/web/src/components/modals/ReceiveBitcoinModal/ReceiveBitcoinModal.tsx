import type { FC } from 'react';

import { useSolAccount } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

const ACCOUNT_CREATION_FEE = 0.00203928;

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const solAccount = useSolAccount();
  const isEnoughSol = (solAccount?.balance?.asNumber ?? 0) >= ACCOUNT_CREATION_FEE;

  if (isEnoughSol) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
