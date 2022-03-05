import type { FC } from 'react';
import { useMemo } from 'react';

import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const tokenAccounts = useUserTokenAccounts();

  const hasSomeBalance = useMemo(() => {
    return tokenAccounts.some((value) => value.balance?.greaterThan(0));
  }, [tokenAccounts]);

  if (hasSomeBalance) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
