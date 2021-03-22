import React, { FunctionComponent } from 'react';

import { Layout } from 'components/common/Layout';
import { ReceiveAddressWidget } from 'components/pages/receive/ReceiveAddressWidget';
// import { ReceiveNewWidget } from 'components/pages/receive/ReceiveNewWidget';
// import { ReceiveWalletsWidget } from 'components/pages/receive/ReceiveWalletsWidget';

export const Receive: FunctionComponent = () => {
  return (
    <Layout
      rightColumn={
        <>
          <ReceiveAddressWidget />
          {/* <ReceiveWalletsWidget /> */}
          {/* <ReceiveNewWidget /> */}
        </>
      }
    />
  );
};
