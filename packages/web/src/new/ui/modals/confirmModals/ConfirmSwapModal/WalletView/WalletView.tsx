import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

import { FieldInfo, InfoTitle, InfoValue, InfoWrapper } from '../../common/styled';
import type { ConfirmSwapModalViewModel } from '../ConfirmSwapModal.ViewModel';

interface Props {
  viewModel: Readonly<ConfirmSwapModalViewModel>;
  type: 'source' | 'destination';
}

export const WalletView: FC<Props> = observer(({ viewModel, type }) => {
  const wallet = type === 'source' ? viewModel.sourceWallet : viewModel.destinationWallet;
  const amountLabel =
    type === 'source' ? viewModel.inputAmountString : viewModel.estimatedAmountString;
  const equityAmountLabel =
    type === 'source'
      ? `~${viewModel.inputAmountInFiatString}`
      : `Receive at least: ${viewModel.receiveAtLeastString}`;

  return (
    <FieldInfo>
      <TokenAvatar token={wallet?.token} size={44} />
      <InfoWrapper>
        <InfoTitle>{amountLabel}</InfoTitle>
        <InfoValue>{equityAmountLabel}</InfoValue>
      </InfoWrapper>
    </FieldInfo>
  );
});
