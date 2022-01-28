import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <ReceiveAddressWidget />
      {/* <ReceiveWalletsWidget /> */}
      {/* <ReceiveNewWidget /> */}
    </Layout>
  );
};
