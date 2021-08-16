import React, { FunctionComponent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';
import { trackEvent } from 'utils/analytics';

export const Swap: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();

  useEffect(() => {
    trackEvent('swap_open', { fromPage: location.state.fromPage });
  }, []);

  return <Layout rightColumn={<SwapWidget />} />;
};
