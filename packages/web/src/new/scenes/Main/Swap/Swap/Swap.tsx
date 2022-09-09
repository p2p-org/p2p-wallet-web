import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { ActionButton } from './ActionButton';
import { SettingsButton } from './SettingsButton';
import { MainSwapView } from './Subviews/MainSwapView';
import { SwapViewModel } from './Swap.ViewModel';

const Wrapper = styled.div``;

export const Swap: FC = observer(() => {
  const viewModel = useViewModel(SwapViewModel);
  const isMobile = useIsMobile();

  return (
    <WidgetPageWithBottom
      title="Swap"
      icon="swap"
      action={!isMobile ? <SettingsButton /> : null}
      bottom={<ActionButton viewModel={viewModel} />}
    >
      <Wrapper>
        <MainSwapView viewModel={viewModel} />
      </Wrapper>
    </WidgetPageWithBottom>
  );
});
