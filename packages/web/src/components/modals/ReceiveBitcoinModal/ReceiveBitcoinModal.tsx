import type { FC } from 'react';

import { useNativeAccount } from '@p2p-wallet-web/sail';

import type { ModalPropsType } from 'app/contexts';
import { useNetworkFees } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const { nativeBalance } = useNativeAccount();
  const { accountRentExemption } = useNetworkFees();
  const isEnoughSol = (nativeBalance?.asNumber ?? 0) >= accountRentExemption.toNumber();

  if (isEnoughSol) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
