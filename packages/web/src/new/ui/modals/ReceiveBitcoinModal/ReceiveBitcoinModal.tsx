import type { FC } from 'react';

import type { ModalPropsType } from 'new/ui/modals/ModalManager';

import { Create } from './Create';
import { TopUp } from './TopUp';

export const ReceiveBitcoinModal: FC<ModalPropsType> = (props) => {
  if (isEnoughSol) {
    return <Create close={props.close} />;
  }

  return <TopUp close={props.close} />;
};
