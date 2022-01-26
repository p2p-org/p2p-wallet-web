import type { FunctionComponent } from 'react';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';

import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import { Layout } from 'components/common/Layout';
import { TokenSettingsWidget } from 'components/pages/wallet';
import { shortAddress } from 'utils/tokens';

export const WalletSettings: FunctionComponent = () => {
  const location = useLocation();
  const { publicKey: _publicKey } = useParams<{ publicKey: string }>();

  const publicKey = usePubkey(_publicKey) as PublicKey;
  const tokenAccount = useTokenAccount(publicKey);

  const tokenName = tokenAccount?.balance?.token.symbol
    ? tokenAccount.balance.token.symbol
    : shortAddress(_publicKey);
  const isZeroBalance = Boolean(tokenAccount?.balance?.toU64().lten(0));

  return (
    <Layout
      breadcrumb={{
        currentName: `${tokenName} Wallet`,
        backTo: {
          pathname: `/wallet/${_publicKey}`,
          state: { fromPage: location.pathname },
        },
      }}
    >
      <TokenSettingsWidget
        publicKey={publicKey}
        tokenName={tokenName}
        isZeroBalance={isZeroBalance}
      />
    </Layout>
  );
};
