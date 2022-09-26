import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { SwapViewModel } from '../../Swap.ViewModel';
import { ReceiveAtLeastView } from './ReceiveAtLeastView';
import { SwitchButton } from './SwitchButton';
import { WalletView } from './WalletView';

const Wrapper = styled.div`
  border: 1px solid ${theme.colors.stroke.tertiary};
  border-radius: 12px;
`;

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const MainSwapView: FC<Props> = observer(({ viewModel }) => {
  const handleSwitchClick = () => {
    viewModel.swapSourceAndDestination();
  };

  return (
    <Wrapper>
      <WalletView type="source" viewModel={viewModel} />
      <SwitchButton onClick={handleSwitchClick} />
      <WalletView type="destination" viewModel={viewModel} />
      <ReceiveAtLeastView viewModel={viewModel} />
    </Wrapper>
  );
});
