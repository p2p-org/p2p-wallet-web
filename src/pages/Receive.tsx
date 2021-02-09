import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { ReceiveWidget } from 'components/pages/receive/ReceiveWidget';

export const Receive: FunctionComponent = () => {
  return <Layout rightColumn={<ReceiveWidget />} />;
};
