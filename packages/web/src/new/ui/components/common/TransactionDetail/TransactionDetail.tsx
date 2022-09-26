import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import type { TransactionIndex } from 'new/services/TransactionHandler';

import { TransactionDetailViewModel } from './TransactionDetail.ViewModel';

const Wrapper = styled.div``;

interface Props {
  observingTransactionIndex?: TransactionIndex;
  parsedTransaction?: ParsedTransaction;
}

// TODO: weird condition to just check >= 0
export const TransactionDetail: FC<Props> = observer(
  ({ observingTransactionIndex, parsedTransaction }) => {
    const viewModel = useViewModel(TransactionDetailViewModel);

    // initialize viewModel if it isn't using two different options
    if (
      typeof observingTransactionIndex !== 'undefined' &&
      observingTransactionIndex !== null &&
      viewModel.observingTransactionIndex === null
    ) {
      viewModel.setObservingTransactionIndex(observingTransactionIndex);
    } else if (parsedTransaction && viewModel.parsedTransaction === null) {
      viewModel.setParsedTransaction(parsedTransaction);
    }

    return <Wrapper>TransactionDetail</Wrapper>;
  },
);
