import type { FC } from 'react';
import React from 'react';

import type { Transaction, TransferTransaction } from '@p2p-wallet-web/core';
import type Decimal from 'decimal.js';

import type { Token } from 'api/token/Token';
import { AmountUSD } from 'components/common/AmountUSD';
import {
  SendWrapper,
  ValueCurrency,
  ValueOriginal,
} from 'components/modals/TransactionInfoModals/common/styled';

export type TransferParams = {
  fromToken: Token;
  fromAmount: Decimal;
};

interface Props {
  params: TransferParams;
  transaction: Transaction<TransferTransaction> | null;
  isReceiver: boolean;
}

export const Send: FC<Props> = ({ params: { fromToken, fromAmount }, transaction, isReceiver }) => {
  return (
    <SendWrapper>
      <ValueCurrency>
        {isReceiver ? '+' : '-'}{' '}
        {transaction?.short.destinationAmount.toNumber() ||
          fromToken.toMajorDenomination(fromAmount).toString()}{' '}
        {transaction?.short.sourceToken?.symbol || fromToken.symbol}
      </ValueCurrency>
      <ValueOriginal>
        <AmountUSD
          prefix={isReceiver ? '+' : '-'}
          symbol={transaction?.short.sourceToken?.symbol || fromToken.symbol}
          value={transaction?.short.destinationAmount || fromToken.toMajorDenomination(fromAmount)}
        />
      </ValueOriginal>
    </SendWrapper>
  );
};
