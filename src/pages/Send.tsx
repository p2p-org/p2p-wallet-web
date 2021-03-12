import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Layout } from 'components/common/Layout';
import { SendWidget } from 'components/common/SendSwapWidget/SendWidget';
import { ResultWidget } from 'components/pages/send/ResultWidget';

export const Send: FunctionComponent = () => {
  const { publicKey, status } = useParams<{ publicKey: string; status: string }>();
  const publicKeySol = useSelector((state) => state.wallet.publicKey);

  return (
    <Layout
      breadcrumb={
        status === 'result'
          ? { currentName: 'Result', backTo: `/send/${publicKey || publicKeySol}` }
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
