import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { useViewModel } from 'new/core/viewmodels';
import { EmptyTransactionsView } from 'new/scenes/Main/WalletDetail/History/Empty';
import { CollectionViewMappingStrategy } from 'new/scenes/Main/WalletDetail/History/SortByDataStrategy';
import type { Wallet } from 'new/sdk/SolanaSDK';
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
  wallet: Wallet | null;
}

export const History: FC<Props> = observer(({ wallet }) => {
  const viewModel = useViewModel(HistoryViewModel);

  useLayoutEffect(() => {
    if (wallet) {
      viewModel.setAccountSymbol(wallet);
    }
  }, [wallet]);

  const content = expr(() => {
    switch (viewModel.stateDriver) {
      case State.items:
        return (
          <NSDNewDynamicSectionsCollectionView<ParsedTransaction>
            viewModel={viewModel}
            mapDataToSections={(viewModel) =>
              CollectionViewMappingStrategy.byData({
                viewModel,
                where: (item) => item.blockTime ?? new Date(),
              })
            }
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

  return (
    <Widget title="Activity">
      <Wrapper>{content}</Wrapper>
    </Widget>
  );
});
