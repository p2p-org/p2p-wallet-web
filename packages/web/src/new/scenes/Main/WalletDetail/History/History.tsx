import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';
import { EmptyTransactionsView } from 'new/scenes/Main/WalletDetail/History/Empty';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import { ErrorView } from './History.ErrorView';
import { HistoryViewModel, State } from './History.ViewModel';
import { TransactionCell } from './TransactionCollectionView/TransactionCell';

export const History: FC = observer(() => {
  const viewModel = useViewModel(HistoryViewModel);

  switch (viewModel.stateDriver) {
    case State.items:
      return (
        <StaticSectionsCollectionView<ParsedTransaction>
          viewModel={viewModel}
          numberOfLoadingCells={7}
          renderPlaceholder={(key) => <TransactionCell key={key} isPlaceholder />}
          renderItem={(item) => <TransactionCell key={item.signature} transaction={item} />}
        />
      );
    case State.empty:
      return <EmptyTransactionsView onClick={() => viewModel.refreshPage()} />;
    case State.error:
      return <ErrorView onClick={() => viewModel.tryAgain()} />;
  }
});
