import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';
import { EmptyTransactionsView } from 'new/scenes/Main/WalletDetail/History/Empty';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import { ErrorView } from './History.ErrorView';
import { HistoryViewModel, State } from './History.ViewModel';

export const History: FC = observer(() => {
  const viewModel = useViewModel(HistoryViewModel);

  switch (viewModel.stateDriver) {
    case State.items:
      return (
        <StaticSectionsCollectionView<ParsedTransaction>
          viewModel={viewModel}
          renderPlaceholder={(key) => {
            // console.log('renderPlaceholder', key);
            return <div key={key}>{key}</div>;
          }}
          renderItem={(item) => {
            // console.log('renderItem', item);
            return <div key={item.signature}>{item.signature}</div>;
          }}
        />
      );
    case State.empty:
      return <EmptyTransactionsView onClick={() => viewModel.refreshPage()} />;
    case State.error:
      return <ErrorView onClick={() => viewModel.tryAgain()} />;
  }
});
