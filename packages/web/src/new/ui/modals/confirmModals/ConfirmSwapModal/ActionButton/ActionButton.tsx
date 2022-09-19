import type { FC } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import { Button } from 'new/ui/components/ui/Button';

import type { ConfirmSwapModalViewModel } from '../ConfirmSwapModal.ViewModel';

const SwapIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  viewModel: Readonly<ConfirmSwapModalViewModel>;
}

export const ActionButton: FC<Props> = observer(({ viewModel, ...props }) => {
  return (
    <Button primary {...props}>
      <SwapIcon name="top" /> Swap {viewModel.sourceWallet?.token.symbol ?? ''} →{' '}
      {viewModel.destinationWallet?.token.symbol ?? ''}
    </Button>
  );
});
