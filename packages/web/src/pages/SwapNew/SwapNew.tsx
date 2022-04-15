import type { FC } from 'react';

import { Layout } from 'components/common/Layout';

import { SwapWidget } from './components/SwapWidget';
import { SwapProvider } from './providers/swap/provider';

export const SwapNew: FC = () => {
  return (
    <SwapProvider>
      <Layout>
        <SwapWidget />
      </Layout>
    </SwapProvider>
  );
};
