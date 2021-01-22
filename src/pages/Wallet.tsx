import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';

import * as web3 from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { ActivityWidget, TopWidget } from 'components/pages/wallet';

export const Wallet: FunctionComponent = () => {
  const { publicKey } = useParams<{ publicKey: string }>();

  // const breadcrumbs = [{ name: 'Wallets', to: '/wallets' }, { name: publicKey }];
  const tokenPublicKey = new web3.PublicKey(publicKey);

  return (
    <Layout
      rightColumn={
        <>
          <TopWidget publicKey={tokenPublicKey} />
          <QRAddressWidget publicKey={tokenPublicKey} />
          <ActivityWidget publicKey={tokenPublicKey} />
        </>
      }
    />
  );
};
