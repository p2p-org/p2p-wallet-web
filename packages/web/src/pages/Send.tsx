import type { FunctionComponent } from 'react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';
import { trackEvent } from 'utils/analytics';

export const Send: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();
  const publicKeySol = useSelector((state) => state.wallet.publicKey);

  useEffect(() => {
    trackEvent('send_open', { fromPage: location.state.fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout
      breadcrumb={
        status === 'result'
          ? {
              currentName: 'Result',
              backTo: {
                pathname: `/send/${publicKey || publicKeySol}`,
                state: { fromPage: location.pathname },
              },
            }
          : undefined
      }
      rightColumn={
        status !== 'result' ? (
          <SendWidget publicKey={publicKey || publicKeySol} />
        ) : (
          <ResultWidget />
        )
      }
    />
  );
};
