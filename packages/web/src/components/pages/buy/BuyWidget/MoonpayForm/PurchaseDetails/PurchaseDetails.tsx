import type { FC } from 'react';
import { useMemo } from 'react';

import { useBuyState } from 'app/contexts';
import type { Accordion } from 'components/ui/AccordionDetails';
import { AccordionDetails } from 'components/ui/AccordionDetails';

export const PurchaseDetails: FC = () => {
  const { buyQuote, currency } = useBuyState();

  const accordion = useMemo(() => {
    const lists: Accordion = [
      {
        id: 1,
        rows: [
          {
            id: 1,
            titleClassName: 'gray',
            title: `1 ${currency.symbol} price`,
            value: `$${buyQuote?.quoteCurrencyPrice.toFixed(2) || 0}`,
          },
        ],
      },
      {
        id: 2,
        rows: [
          {
            id: 1,
            titleClassName: 'gray',
            title: `${currency.symbol} purchase cost`,
            value: `$${
              buyQuote ? (buyQuote.quoteCurrencyPrice * buyQuote.quoteCurrencyAmount).toFixed(2) : 0
            }`,
          },
          {
            id: 2,
            titleClassName: 'gray',
            title: 'Processing fee',
            value: `$${buyQuote?.feeAmount.toFixed(2) || 0}`,
          },
          {
            id: 3,
            titleClassName: 'gray',
            title: 'Network fee',
            value: `$${buyQuote?.networkFeeAmount.toFixed(2) || 0}`,
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
            value: `$${buyQuote?.totalAmount.toFixed(2) || 0}`,
          },
        ],
      },
    ];

    return lists;
  }, [buyQuote, currency.symbol]);

  return (
    <AccordionDetails
      title="Purchase details"
      titleBottomName="Total amount spent"
      titleBottomValue={`$${buyQuote?.totalAmount.toFixed(2) || 0}`}
      accordion={accordion}
    />
  );
};
