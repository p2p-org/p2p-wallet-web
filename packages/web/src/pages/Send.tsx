import type { FunctionComponent } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useWallet } from '@p2p-wallet-web/core';

import { FeeCompensationProvider, SendStateProvider } from 'app/contexts';
import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';

export const Send: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();
  const { publicKey: publicKeySol } = useWallet();

  return (
    <FeeCompensationProvider>
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
        >
          {status !== 'result' ? <SendWidget /> : <ResultWidget />}
        </Layout>
      </SendStateProvider>
    </FeeCompensationProvider>
  );
};
