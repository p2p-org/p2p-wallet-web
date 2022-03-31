import type { FC } from 'react';

import type { TokenAmount } from '@saberhq/token-utils';
import type { u64 } from '@solana/spl-token';

import type { ModalPropsType } from 'app/contexts';

import { Create } from './Create';
import { TopUp } from './TopUp';

interface Props {
  accountRentExemption: u64;
  nativeBalance: TokenAmount;
}

export const ReceiveBitcoinModal: FC<ModalPropsType<boolean, Props>> = (props) => {
  const nativeLamports = props.nativeBalance?.toU64().toNumber() ?? 0;
  const lamportsRentExcemption = props.accountRentExemption.toNumber();
  const isEnoughSol = nativeLamports > lamportsRentExcemption;

  if (isEnoughSol) {
    return <Create close={props.close} />;
  }

  return <TopUp close={props.close} />;
};
