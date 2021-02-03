import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';

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
