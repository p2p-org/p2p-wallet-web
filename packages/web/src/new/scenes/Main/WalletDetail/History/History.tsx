import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { useViewModel } from 'new/core/viewmodels';
import { EmptyTransactionsView } from 'new/scenes/Main/WalletDetail/History/Empty';
import { CollectionViewMappingStrategy } from 'new/scenes/Main/WalletDetail/History/SortByDataStrategy';
import type { WalletDetailViewModel } from 'new/scenes/Main/WalletDetail/WalletDetail.ViewModel';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { NSDNewDynamicSectionsCollectionView } from 'new/ui/components/common/NSDNewDynamicSectionsCollectionView';
import { Widget } from 'new/ui/components/common/Widget';

import { ErrorView } from './History.ErrorView';
import { HistoryViewModel, State } from './History.ViewModel';
import { TransactionCell } from './TransactionCollectionView/TransactionCell';

const Wrapper = styled.div`
  margin: 0 10px;
`;

interface Props {
  viewModel: Readonly<WalletDetailViewModel>;
}

export const History: FC<Props> = observer(({ viewModel }) => {
  const vm = useViewModel(HistoryViewModel);

  useLayoutEffect(() => {
    if (viewModel.wallet) {
      vm.setAccountSymbol(viewModel.wallet);
    }
  }, [viewModel.wallet]);

  const handleTransactionClick = (tx: ParsedTransaction) => viewModel.showTransaction(tx);

  const content = expr(() => {
    switch (vm.stateDriver) {
      case State.items:
        return (
          <NSDNewDynamicSectionsCollectionView<ParsedTransaction>
            viewModel={vm}
            mapDataToSections={(viewModel) =>
              CollectionViewMappingStrategy.byData({
                viewModel,
                where: (item) => item.blockTime ?? new Date(),
              })
            }
            numberOfLoadingCells={7}
            renderPlaceholder={(key) => <TransactionCell key={key} isPlaceholder />}
            renderItem={(item) => (
              <TransactionCell
                key={item.signature}
                transaction={item}
                onTransactionClick={() => handleTransactionClick(item)}
              />
            )}
          />
        );
      case State.empty:
        return <EmptyTransactionsView onClick={() => vm.refreshPage()} />;
      case State.error:
        return <ErrorView onClick={() => vm.tryAgain()} />;
    }
  });

  return (
    <Widget title="Activity">
      <Wrapper>{content}</Wrapper>
    </Widget>
  );
});
