import type { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import type { AccordionList } from 'new/ui/components/ui/AccordionDetails';
import { AccordionDetails } from 'new/ui/components/ui/AccordionDetails';
import { numberToFiatString } from 'new/utils/NumberExtensions';

import type { BuyViewModelProps } from '../types';

export const Details: FC<BuyViewModelProps> = observer(({ viewModel }) => {
  const accordion = expr<AccordionList>(() => {
    const lists: AccordionList = [
      {
        id: 1,
        rows: [
          {
            id: 1,
            titleClassName: 'gray',
            title: `1 ${viewModel.crypto.symbol} price`,
            value: numberToFiatString(viewModel.output.price),
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
            value: numberToFiatString(viewModel.output.purchaseCost),
          },
          {
            id: 2,
            titleClassName: 'gray',
            title: 'Processing fee',
            value: numberToFiatString(viewModel.output.processingFee),
          },
          {
            id: 3,
            titleClassName: 'gray',
            title: 'Network fee',
            value: numberToFiatString(viewModel.output.networkFee),
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
            value: numberToFiatString(viewModel.output.total),
          },
        ],
      },
    ];

    return lists;
  });

  return (
    <AccordionDetails
      title="Purchase details"
      titleBottomName="Total amount spent"
      titleBottomValue={numberToFiatString(viewModel.output.total)}
      accordion={accordion}
    />
  );
});
