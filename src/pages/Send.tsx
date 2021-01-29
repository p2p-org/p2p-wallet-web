import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { ResultWidget } from 'components/pages/send/ResultWidget';
import { SendWidget } from 'components/pages/send/SendWidget';

export const Send: FunctionComponent = () => {
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();

  // const breadcrumbs: { name: string; to?: string }[] = [{ name: 'Wallets', to: '/wallets' }];
  //
  // if (status === 'result') {
  //   breadcrumbs.push({ name: 'Send', to: `/send/${publicKey}` }, { name: 'Result' });
  // } else {
  //   breadcrumbs.push({ name: 'Send' });
  // }

  return (
    <Layout
      // breadcrumbs={breadcrumbs}
      rightColumn={status !== 'result' ? <SendWidget publicKey={publicKey} /> : <ResultWidget />}
    />
  );
};
