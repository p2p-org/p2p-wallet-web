import type { FC } from 'react';

import type { TokenAmount } from '@saberhq/token-utils';
import type { u64 } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

interface Props {
  accountRentExemption: u64;
  nativeBalance: TokenAmount;
}

export const ReceiveBitcoinModal: FC<ModalPropsType<boolean, Props>> = (props) => {
  const solsInFee = props.accountRentExemption.toNumber() / LAMPORTS_PER_SOL;
  const isEnoughSol = (props.nativeBalance?.asNumber ?? 0) >= solsInFee;

  if (isEnoughSol) {
    return <Create close={props.close} />;
  }

  return <TopUp close={props.close} />;
};
