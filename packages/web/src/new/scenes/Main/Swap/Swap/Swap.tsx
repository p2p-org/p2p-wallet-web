import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsMobile } from '@p2p-wallet-web/ui';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { Button } from 'components/ui';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { SettingsButton } from './SettingsButton';
import { MainSwapView } from './Subviews/MainSwapView';
import { SwapViewModel } from './Swap.ViewModel';

const Wrapper = styled.div``;

export const Swap: FC = () => {
  const viewModel = useViewModel(SwapViewModel);
  const isMobile = useIsMobile();

  const renderButton = () => {
    return !isMobile ? <SettingsButton /> : null;
  };

  return (
    <WidgetPageWithBottom
      title="Swap"
      icon="swap"
      bottom={
        <Button primary full>
          Swap
        </Button>
      }
      action={renderButton()}
    >
      <Wrapper>
        <MainSwapView viewModel={viewModel} />
      </Wrapper>
    </WidgetPageWithBottom>
  );
};
