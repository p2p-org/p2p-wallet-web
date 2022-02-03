import type { FC } from 'react';

import { MoonpayButton } from 'components/pages/buy/BuyWidget/MoonpayForm/MoonpayButton';
import { WidgetPageBuy } from 'components/pages/buy/BuyWidget/WidgetPageBuy';

import { Inputs } from './Inputs';
import { PurchaseDetails } from './PurchaseDetails';

export const MoonpayForm: FC = () => {
  return (
    <WidgetPageBuy bottom={<MoonpayButton />}>
      <Inputs />
      <PurchaseDetails />
    </WidgetPageBuy>
  );
};
