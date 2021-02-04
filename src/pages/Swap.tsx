import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { SwapWidget } from 'components/common/SendSwapWidget/SwapWidget';

export const Swap: FunctionComponent = () => {
  return <Layout rightColumn={<SwapWidget />} />;
};
