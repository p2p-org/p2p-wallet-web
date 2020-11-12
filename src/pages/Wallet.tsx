import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import * as web3 from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { ActionsWidget, ActivityWidget } from 'components/pages/wallet';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

type Props = {};

export const Wallet: FunctionComponent<Props> = (props) => {
  const { symbol: aliasSymbol } = useParams<{ symbol: string }>();
  const breadcrumbs = [{ name: 'Wallets', to: '/dashboard' }, { name: aliasSymbol }];

  const { mint } = usePopulateTokenInfo({
    mint: aliasSymbol,
    symbol: aliasSymbol,
  });

  if (!mint) {
    return <div>No found token</div>;
  }

  const accountAddress = new web3.PublicKey(mint);

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      leftColumn={
        <>
          <ActionsWidget address={accountAddress} />
          <ActivityWidget address={accountAddress} />
        </>
      }
      rightColumn={<div />}
    />
  );
};
