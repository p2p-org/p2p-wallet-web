import type { FC } from 'react';

import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';

import type { Accordion } from 'components/ui/AccordionDetails';
import { AccordionDetails } from 'components/ui/AccordionDetails';
import type { BuyViewModelProps } from 'new/scenes/Main/Buy/Subviews/Moonpay/types';
import { formatNumberToUSD } from 'utils/format';

export const Details: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  const accordion = computed(() => {
    const lists: Accordion = [
      {
        id: 1,
        rows: [
          {
            id: 1,
            titleClassName: 'gray',
            title: `1 ${viewModel.crypto.symbol} price`,
            value: formatNumberToUSD(viewModel.output.price || 0),
          },
        ],
      },
      {
        id: 2,
        rows: [
          {
            id: 1,
            titleClassName: 'gray',
            title: `${viewModel.crypto.symbol} purchase cost`,
            value: formatNumberToUSD(viewModel.output.purchaseCost),
          },
          {
            id: 2,
            titleClassName: 'gray',
            title: 'Processing fee',
            value: formatNumberToUSD(viewModel.output.processingFee),
          },
          {
            id: 3,
            titleClassName: 'gray',
            title: 'Network fee',
            value: formatNumberToUSD(viewModel.output.networkFee),
          },
        ],
      },
      {
        id: 3,
        className: 'total',
        rows: [
          {
            id: 1,
            title: 'Total',
            value: formatNumberToUSD(viewModel.output.total),
          },
        ],
      },
    ];

    return lists;
  }).get();

  return (
    <AccordionDetails
      title="Purchase details"
      titleBottomName="Total amount spent"
      titleBottomValue={formatNumberToUSD(viewModel.output.total)}
      accordion={accordion}
    />
  );
});