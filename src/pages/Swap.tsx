import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/pages/swap/SwapWidget';

export const Swap: FunctionComponent = () => {
  return <Layout rightColumn={<SwapWidget />} />;
};
