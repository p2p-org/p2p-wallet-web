import type { FC } from 'react';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type { ModalPropsType } from 'app/contexts';
import { Loader } from 'components/common/Loader';

import { Create } from './Create';
import { TopUp } from './TopUp';

interface Props {
  accountRentExemption: any;
  nativeAccount: any;
}

export const ReceiveBitcoinModal: FC<ModalPropsType<boolean, Props>> = (props) => {
  const solsInFee = props.accountRentExemption.toNumber() / LAMPORTS_PER_SOL;
  const isEnoughSol = (props.nativeAccount?.nativeBalance?.asNumber ?? 0) >= solsInFee;

  if (!props.nativeAccount?.nativeBalance) {
    return <Loader size={'50'} />;
  }

  if (isEnoughSol) {
    return <Create close={props.close} />;
  }

  return <TopUp close={props.close} />;
};
