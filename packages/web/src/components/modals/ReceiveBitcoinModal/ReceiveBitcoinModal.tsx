import type { FC } from 'react';

import { useNativeAccount } from '@p2p-wallet-web/sail';

import type { ModalPropsType } from 'app/contexts';

// import { useNetworkFees } from 'app/contexts';
import { Create } from './Create';
import { TopUp } from './TopUp';

const ACCOUNT_CREATION_FEE = 0.00203928;

export const ReceiveBitcoinModal: FC<ModalPropsType> = ({ close }) => {
  const { nativeBalance } = useNativeAccount();
  // const fees = useNetworkFees();
  const isEnoughSol = (nativeBalance?.asNumber ?? 0) >= ACCOUNT_CREATION_FEE;

  // console.log(nativeBalance?.asNumber, solAccount?.balance?.asNumber, fees);

  if (isEnoughSol) {
    return <Create close={close} />;
  }

  return <TopUp close={close} />;
};
