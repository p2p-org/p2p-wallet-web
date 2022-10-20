import type { FC } from 'react';

import { styled } from '@linaria/react';

import { useViewModel } from 'new/core/viewmodels';
import { EmptyTransactionsView } from 'new/scenes/Main/WalletDetail/History/Empty';

import { ErrorView } from './History.ErrorView';
import { HistoryViewModel, State } from './History.ViewModel';

const Wrapper = styled.div``;

export const History: FC = () => {
  const viewModel = useViewModel(HistoryViewModel);

  switch (viewModel.stateDriver) {
    case State.items:
      return content;
    case State.empty:
      return <EmptyTransactionsView onClick={() => viewModel.refreshPage()} />;
    case State.error:
      return <ErrorView onClick={() => viewModel.tryAgain()} />;
  }
};
