import type { FC } from 'react';

import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const tokenAccounts = useUserTokenAccounts();

  if (tokenAccounts.length) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
