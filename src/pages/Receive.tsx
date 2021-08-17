import React, { FunctionComponent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { ReceiveAddressWidget } from 'components/pages/receive/ReceiveAddressWidget';
import { trackEvent } from 'utils/analytics';
// import { ReceiveNewWidget } from 'components/pages/receive/ReceiveNewWidget';
// import { ReceiveWalletsWidget } from 'components/pages/receive/ReceiveWalletsWidget';

export const Receive: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();

  useEffect(() => {
    trackEvent('receive_open', { fromPage: location.state.fromPage });
  }, [location.state.fromPage]);

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
