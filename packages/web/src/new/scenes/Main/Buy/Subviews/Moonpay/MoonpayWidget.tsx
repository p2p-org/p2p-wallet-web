import type { FC } from 'react';

import { useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { MoonpayButton } from 'new/scenes/Main/Buy/Subviews/Moonpay/Button';
import { CurrencySelect } from 'new/scenes/Main/Buy/Subviews/Moonpay/CurrencySelector';
import { Details } from 'new/scenes/Main/Buy/Subviews/Moonpay/Details/Details';
import { Inputs } from 'new/scenes/Main/Buy/Subviews/Moonpay/Inputs';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { WidgetPageBuy } from 'new/ui/components/pages/buy/WidgetPageBuy';

export const MoonpayWidget: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  const isMobile = useIsMobile();

  return (
    <WidgetPageBuy bottom={<MoonpayButton viewModel={viewModel} />}>
      {!isMobile ? <CurrencySelect viewModel={viewModel} /> : null}
      <Inputs viewModel={viewModel} />
      <Details viewModel={viewModel} />
    </WidgetPageBuy>
  );
});
