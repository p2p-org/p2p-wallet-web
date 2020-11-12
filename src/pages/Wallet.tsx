import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { Layout } from 'components/common/Layout';
import { ActionsWidget, ActivityWidget } from 'components/pages/wallet';

const Wrapper = styled.div``;

type Props = {};

export const Wallet: FunctionComponent<Props> = (props) => {
  const { symbol } = useParams();
  const breadcrumbs = [{ name: 'Wallets', to: '/dashboard' }, { name: symbol }];

  const accountAddress = new web3.PublicKey(symbol);

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      leftColumn={
        <>
          <ActionsWidget symbol={symbol} />
          <ActivityWidget address={accountAddress} />
        </>
      }
      rightColumn={<div />}
    />
  );
};
