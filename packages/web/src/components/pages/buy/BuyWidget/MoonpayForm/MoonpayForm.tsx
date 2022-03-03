import type { FC } from 'react';

import { WidgetPageBuy } from '../WidgetPageBuy';
import { CurrencySelect } from './CurrencySelect';
import { Inputs } from './Inputs';
import { MoonpayButton } from './MoonpayButton';
import { PurchaseDetails } from './PurchaseDetails';

export const MoonpayForm: FC = () => {
  return (
    <WidgetPageBuy bottom={<MoonpayButton />}>
      <CurrencySelect />
      <Inputs />
      <PurchaseDetails />
    </WidgetPageBuy>
  );
};
