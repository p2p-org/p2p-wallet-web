import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import * as web3 from '@solana/web3.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Layout } from 'components/common/Layout';
import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { ActivityWidget, TopWidget } from 'components/pages/wallet';
import { RootState } from 'store/rootReducer';
import { shortAddress } from 'utils/tokens';

export const Wallet: FunctionComponent = () => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const tokenPublicKey = new web3.PublicKey(publicKey);

  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(tokenPublicKey)),
    [tokenAccounts, publicKey],
  );

  return (
    <Layout
      breadcrumb={{
        currentName: tokenAccount?.mint.symbol
          ? `${tokenAccount.mint.symbol} Wallet`
          : `${shortAddress(publicKey)} Wallet`,
        backTo: '/wallets',
      }}
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
