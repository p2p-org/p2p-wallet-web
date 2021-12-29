import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useWallet } from '@p2p-wallet-web/core';

import { SendStateProvider } from 'app/contexts';
import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';
import { trackEvent } from 'utils/analytics';

export const Send: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();
  const { publicKey: publicKeySol } = useWallet();

  useEffect(() => {
    trackEvent('send_open', { fromPage: location.state.fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SendStateProvider>
      <Layout
        breadcrumb={
          status === 'result'
            ? {
                currentName: 'Result',
                backTo: {
                  pathname: `/send/${publicKey || publicKeySol?.toBase58()}`,
                  state: { fromPage: location.pathname },
                },
              }
            : undefined
        }
        rightColumn={status !== 'result' ? <SendWidget /> : <ResultWidget />}
      />
    </SendStateProvider>
  );
};
