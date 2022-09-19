import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { Accordion } from 'components/ui';
import { AccordionTitle } from 'components/ui/AccordionDetails/AccordionTitle';
import { DetailFeesView } from 'new/scenes/Main/Swap/Swap/Subviews/DetailsView/DetailFeesView';
import { RatesStackView } from 'new/scenes/Main/Swap/Swap/Subviews/DetailsView/RatesStackView';
import { numberToString } from 'new/utils/NumberExtensions';

import type { ConfirmSwapModalViewModel } from '../ConfirmSwapModal.ViewModel';
import { SlippageView } from './SlippageView';

interface Props {
  viewModel: Readonly<ConfirmSwapModalViewModel>;
}

export const DetailsView: FC<Props> = observer(({ viewModel }) => {
  const totalFee = expr(() => {
    const totalFees = viewModel.totalFees;
    if (totalFees) {
      const { amount, decimals, totalFeesSymbol } = totalFees;
      return `${numberToString(amount, { maximumFractionDigits: decimals })} ${totalFeesSymbol}`;
    }
    return '';
  });

  return (
    <Accordion
      title={
        <AccordionTitle
          title="Swap details"
          titleBottomName="Total fee"
          titleBottomValue={totalFee}
        />
      }
      open={true}
      noContentPadding
    >
      <RatesStackView
        exchangeRate={viewModel.exchangeRate}
        sourceWallet={viewModel.sourceWallet}
        destinationWallet={viewModel.destinationWallet}
      />
      <DetailFeesView viewModel={viewModel} slippageView={<SlippageView viewModel={viewModel} />} />
    </Accordion>
  );
});
