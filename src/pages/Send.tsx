import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { SendWidget } from 'components/common/SendSwapWidget/SendWidget';
import { ResultWidget } from 'components/pages/send/ResultWidget';

export const Send: FunctionComponent = () => {
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();

  return (
    <Layout
      breadcrumb={
        status === 'result' ? { currentName: 'Result', backTo: `/send/${publicKey}` } : undefined
      }
      rightColumn={status !== 'result' ? <SendWidget publicKey={publicKey} /> : <ResultWidget />}
    />
  );
};
