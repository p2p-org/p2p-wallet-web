import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import * as web3 from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { ActionsWidget, ActivityWidget } from 'components/pages/wallet';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

type Props = {};

export const Wallet: FunctionComponent<Props> = (props) => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { mint } = usePopulateTokenInfo({
    mint: publicKey,
  });

  const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: publicKey }];
  const tokenPublicKey = new web3.PublicKey(publicKey);

  return (
    <Layout
      breadcrumbs={breadcrumbs}
      leftColumn={
        <>
          <ActionsWidget publicKey={tokenPublicKey} />
          <ActivityWidget publicKey={tokenPublicKey} />
        </>
      }
      rightColumn={
        <>
          <QRAddressWidget publicKey={tokenPublicKey} />
        </>
      }
    />
  );
};
