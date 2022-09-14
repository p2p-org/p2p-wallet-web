import type { FC } from 'react';
import { Route, useRouteMatch } from 'react-router';
import { Switch } from 'react-router-dom';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { ReceiveViewModel } from 'new/scenes/Main/Receive/Receive.ViewModel';
import { ReceiveToken } from 'new/scenes/Main/Receive/ReceiveToken';
import { SupportedTokens } from 'new/scenes/Main/Receive/SupportedTokens';

export const Receive: FC = () => {
  const match = useRouteMatch();
  const viewModel = useViewModel(ReceiveViewModel);

  return (
    <Switch>
      <Route path={`${match.path}/tokens`}>
        <SupportedTokens viewModel={viewModel.supportedTokensViewModel} />
      </Route>
      <Route path={match.path} exact>
        <ReceiveToken viewModel={viewModel} />
      </Route>
    </Switch>
  );
};
