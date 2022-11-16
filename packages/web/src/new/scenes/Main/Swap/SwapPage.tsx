import type { FC } from 'react';
import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { useTrackOpenPageAction } from 'new/sdk/Analytics';
import { Layout } from 'new/ui/components/common/Layout';

import { Swap } from './Swap';
import { GoBackButton } from './Swap/GoBackButton';
import { SettingsButton } from './Swap/SettingsButton';
import { SwapViewModel } from './Swap/Swap.ViewModel';
import { SwapSettings } from './SwapSettings';

export const SwapPage: FC = () => {
  useTrackOpenPageAction('Swap_Start_Screen');

  // we initialize it here to SwapSettings be available to resolve it
  // in its ViewModel
  const viewModel = useViewModel(SwapViewModel);

  const isMobile = useIsMobile();

  const mobileHeaderButton = useMemo(() => {
    if (!isMobile) {
      return null;
    }

    return (
      <Routes>
        <Route index element={<SettingsButton />} />
        <Route path="settings" element={<GoBackButton />} />
      </Routes>
    );
  }, [isMobile]);

  return (
    <Layout mobileAction={mobileHeaderButton}>
      <Routes>
        <Route index element={<Swap viewModel={viewModel} />} />
        <Route path=":publicKey" element={<Swap viewModel={viewModel} />} />

        <Route path="settings" element={<SwapSettings viewModel={viewModel} />} />
      </Routes>
    </Layout>
  );
};
