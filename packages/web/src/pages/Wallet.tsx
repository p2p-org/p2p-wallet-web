import type { FunctionComponent } from 'react';
import { memo } from 'react';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';

import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { QRAddressWidget } from 'components/common/QRAddressWidget';
import { TopWidget, TransactionsWidget } from 'components/pages/wallet';
import { shortAddress } from 'utils/tokens';

export const WalletOrigin: FunctionComponent = () => {
  const location = useLocation();
  const { publicKey: _publicKey } = useParams<{ publicKey: string }>();

  const publicKey = usePubkey(_publicKey) as PublicKey;
  const tokenAccount = useTokenAccount(publicKey);

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
    >
      <TopWidget publicKey={_publicKey} />
      <QRAddressWidget publicKey={_publicKey} />
      <TransactionsWidget publicKey={_publicKey} />
    </Layout>
  );
};

export const Wallet = memo(WalletOrigin);
