import type { FC } from 'react';
import { useMemo } from 'react';

import { useBuyState } from 'app/contexts';
import type { Accordion } from 'components/ui/AccordionDetails';
import { AccordionDetails } from 'components/ui/AccordionDetails';
import { formatNumberToUSD } from 'components/utils/format';

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
            value: formatNumberToUSD(buyQuote?.quoteCurrencyPrice || 0),
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
            value: formatNumberToUSD(
              buyQuote ? buyQuote.quoteCurrencyPrice * buyQuote.quoteCurrencyAmount : 0,
            ),
          },
          {
            id: 2,
            titleClassName: 'gray',
            title: 'Processing fee',
            value: formatNumberToUSD(buyQuote?.feeAmount || 0),
          },
          {
            id: 3,
            titleClassName: 'gray',
            title: 'Network fee',
            value: formatNumberToUSD(buyQuote?.networkFeeAmount || 0),
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
            value: formatNumberToUSD(buyQuote?.totalAmount || 0),
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
      titleBottomValue={formatNumberToUSD(buyQuote?.totalAmount || 0)}
      accordion={accordion}
    />
  );
};
