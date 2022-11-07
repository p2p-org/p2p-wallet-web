import type { FC } from 'react';
import { useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Layout } from 'new/ui/components/common/Layout';

import { Swap } from './Swap';
import { GoBackButton } from './Swap/GoBackButton';
import { SettingsButton } from './Swap/SettingsButton';
import { SwapViewModel } from './Swap/Swap.ViewModel';
import { SwapSettings } from './SwapSettings';

export const SwapPage: FC = () => {
  // we initialize it here to SwapSettings be available to resolve it
  // in its ViewModel
  const viewModel = useViewModel(SwapViewModel);

  const isMobile = useIsMobile();

  const mobileHeaderButton = useMemo(() => {
    if (!isMobile) {
      return null;
    }

    return (
      <Switch>
        <Route path={`/swap/settings/:publicKey?`}>
          <GoBackButton />
        </Route>
        <Route path={'/swap/:publicKey?'}>
          <SettingsButton />
        </Route>
      </Switch>
    );
  }, [isMobile]);

  return (
    <Layout mobileAction={mobileHeaderButton}>
      <Switch>
        <Route path={`/swap/settings/:publicKey?`}>
          <SwapSettings viewModel={viewModel} />
        </Route>
        <Route path={'/swap/:publicKey?'}>
          <Swap viewModel={viewModel} />
        </Route>
      </Switch>
    </Layout>
  );
};
