import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { SwitchButton } from 'new/scenes/Main/Swap/Swap/Subviews/MainSwapView/SwitchButton';
import type { SwapViewModel } from 'new/scenes/Main/Swap/Swap/Swap.ViewModel';

import { WalletView } from './WalletView';

const Wrapper = styled.div``;

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
    </Wrapper>
  );
});
