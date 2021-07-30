import React, { FunctionComponent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/common/SwapWidget';
import { Providers } from 'components/pages/swap/Providers';
import { trackEvent } from 'utils/analytics';

export const Swap: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();

  useEffect(() => {
    trackEvent('swap_open', { fromPage: location.state.fromPage });
  }, []);

  return (
    <Layout
      rightColumn={
        <Providers>
          <SwapWidget />
        </Providers>
      }
    />
  );
};
