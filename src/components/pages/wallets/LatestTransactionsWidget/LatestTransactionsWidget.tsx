import React, { FunctionComponent } from 'react';

import { TransactionList } from 'components/common/TransactionList';
import { Widget } from 'components/common/Widget';

// const ITEMS = [
//   {
//     type: 'Receive Tokens',
//     date: '11 oct 2020',
//     usd: '+ 44,51 US$',
//     value: '0,00344 Tkns',
//   },
//   {
//     type: 'Receive Tokens',
//     date: '11 oct 2020',
//     usd: '44,51 US$',
//     value: '0,00344 Tkns',
//   },
//   {
//     type: 'Top-up',
//     date: '11 oct 2020',
//     usd: '+ 144,51 US$',
//     value: '0,00344 Tkns',
//   },
// ];

export const LatestTransactionsWidget: FunctionComponent = () => {
  return (
    <Widget title="Latest transactions">
      <TransactionList
      // order={ITEMS}
      />
    </Widget>
  );
};
