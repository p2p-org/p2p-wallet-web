import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';

import { ActionButton } from './ActionButton';
import { SettingsButton } from './SettingsButton';
import { DetailsView } from './Subviews/DetailsView';
import { MainSwapView } from './Subviews/MainSwapView';
import type { SwapViewModel } from './Swap.ViewModel';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
`;

interface Props {
  viewModel: Readonly<SwapViewModel>;
}

export const Swap: FC<Props> = observer(({ viewModel }) => {
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
        {viewModel.isShowingShowDetailsButton ? <DetailsView viewModel={viewModel} /> : null}
      </Wrapper>
    </WidgetPageWithBottom>
  );
});
