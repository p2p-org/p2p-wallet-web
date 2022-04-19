import type { FC } from 'react';

import type { TokenAccount, Transaction, TransferTransaction } from '@p2p-wallet-web/core';
import { useTokenAccountAmount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { TokenAmount } from '@saberhq/token-utils';

import { AmountUSD } from 'components/common/AmountUSD';
import {
  SendWrapper,
  ValueCurrency,
  ValueOriginal,
} from 'components/modals/TransactionInfoModals/common/styled';
import { NUMBER_FORMAT } from 'components/utils/format';

export type TransferParams = {
  source: TokenAccount;
  amount: TokenAmount;
};

interface Props {
  params: TransferParams;
  transaction?: Transaction<TransferTransaction>;
}

export const Send: FC<Props> = ({ params: { amount }, transaction }) => {
  const tokenAmount = useTokenAccountAmount(
    usePubkey(transaction?.details.tokenAccount),
    transaction?.details.amount,
  );

  return (
    <SendWrapper>
      <ValueCurrency>
        {transaction?.details.isReceiver ? '+' : '-'}{' '}
        {tokenAmount?.balance?.formatUnits(NUMBER_FORMAT) || amount.formatUnits(NUMBER_FORMAT)}
      </ValueCurrency>
      <ValueOriginal>
        <AmountUSD
          prefix={transaction?.details.isReceiver ? '+' : '-'}
          value={tokenAmount?.balance || amount}
        />
      </ValueOriginal>
    </SendWrapper>
  );
};
