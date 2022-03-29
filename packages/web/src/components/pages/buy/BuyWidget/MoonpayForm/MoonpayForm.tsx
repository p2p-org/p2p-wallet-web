import type { FC } from 'react';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { WidgetPageBuy } from '../WidgetPageBuy';
import { CurrencySelect } from './CurrencySelect';
import { Inputs } from './Inputs';
import { MoonpayButton } from './MoonpayButton';
import { PurchaseDetails } from './PurchaseDetails';

export const MoonpayForm: FC = () => {
  const isMobile = useIsMobile();

  return (
    <WidgetPageBuy bottom={<MoonpayButton />}>
      {!isMobile ? <CurrencySelect /> : null}
      <Inputs />
      <PurchaseDetails />
    </WidgetPageBuy>
  );
};
