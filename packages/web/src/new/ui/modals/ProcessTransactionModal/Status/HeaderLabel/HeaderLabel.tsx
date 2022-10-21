import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { TransactionStatusType } from 'new/app/models/PendingTransaction';
import { FeeRelayerError } from 'new/sdk/FeeRelayer';

import * as ProcessTransaction from '../../ProcessTransaction.Models';
import type { ProcessTransactionModalViewModel } from '../../ProcessTransactionModal.ViewModel';

const Wrapper = styled.div`
  padding: 0 30px;
`;

interface Props {
  viewModel: Readonly<ProcessTransactionModalViewModel>;
}

export const HeaderLabel: FC<Props> = observer(({ viewModel }) => {
  const text = expr(() => {
    const info = viewModel.pendingTransaction;
    if (!info) {
      return '';
    }

    const originalText = info.rawTransaction.isSwap
      ? 'The swap is being processed'
      : 'The transaction is being processed';

    switch (info.status.type) {
      case TransactionStatusType.sending:
      case TransactionStatusType.confirmed:
        return originalText;
      case TransactionStatusType.error: {
        // TODO: check all condition works
        const error = info.status.error;
        if (error) {
          if (error.message.includes('Swap instruction exceeds desired slippage limit')) {
            return 'Low slippage caused the swap to fail';
          }

          if (
            error instanceof FeeRelayerError &&
            error.code === FeeRelayerError.topUpSuccessButTransactionThrows().code
          ) {
            return 'The transaction failed due to a blockchain error';
          }
        }
        return 'The transaction has been rejected';
      }
      case TransactionStatusType.finalized: {
        // TODO: check all condition works
        const transaction = info.rawTransaction;
        if (transaction instanceof ProcessTransaction.SendTransaction) {
          return `${transaction.sender.token.symbol} was sent successfully`;
        }

        if (transaction instanceof ProcessTransaction.SwapTransaction) {
          return `${transaction.sourceWallet.token.symbol} → ${transaction.destinationWallet.token.symbol} swapped successfully`;
        }

        throw Error('fatal');
      }
    }
  });

  return <Wrapper>{text}</Wrapper>;
});
