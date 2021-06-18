import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { SendWidget } from 'components/common/SendSwapWidget/SendWidget';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { trackEvent } from 'utils/analytics';

export const Send: FunctionComponent = () => {
  const location = useLocation<{ fromPage: string }>();
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();
  const publicKeySol = useSelector((state) => state.wallet.publicKey);

  useEffect(() => {
    trackEvent('send_open', { fromPage: location.state.fromPage });
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
