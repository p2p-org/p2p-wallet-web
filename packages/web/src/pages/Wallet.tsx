import type { FunctionComponent } from 'react';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';

import { useUserTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { ActivityWidget, TopWidget } from 'components/pages/wallet';
import { trackEvent } from 'utils/analytics';
import { shortAddress } from 'utils/tokens';

export const WalletOrigin: FunctionComponent = () => {
  const location = useLocation();
  const { publicKey: _publicKey } = useParams<{ publicKey: string }>();

  const publicKey = usePubkey(_publicKey) as PublicKey;
  const tokenAccount = useUserTokenAccount(publicKey);

  useEffect(() => {
    if (tokenAccount?.balance?.token.symbol) {
      trackEvent('wallet_open', { tokenTicker: tokenAccount.balance.token.symbol });
    }
  }, [tokenAccount?.balance?.token.symbol]);

  return (
    <Layout
      breadcrumb={{
        currentName: tokenAccount?.balance?.token.symbol
          ? `${tokenAccount.balance.token.symbol} Wallet`
          : `${shortAddress(_publicKey)} Wallet`,
        backTo: {
          pathname: `/wallets`,
          state: { fromPage: location.pathname },
        },
      }}
      rightColumn={
        <>
          <TopWidget publicKey={_publicKey} />
          <QRAddressWidget publicKey={_publicKey} />
          <ActivityWidget publicKey={_publicKey} />
        </>
      }
    />
  );
};

export const Wallet = React.memo(WalletOrigin);
