import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';

import { PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Layout } from 'components/common/Layout';
import { TokenSettingsWidget } from 'components/pages/wallet';
import { RootState } from 'store/rootReducer';
import { shortAddress } from 'utils/tokens';

export const WalletSettings: FunctionComponent = () => {
  const location = useLocation();
  const { publicKey } = useParams<{ publicKey: string }>();

  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenPublicKey = useMemo(() => new PublicKey(publicKey), [publicKey]);
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(tokenPublicKey)),
    [tokenAccounts, tokenPublicKey],
  );

  const tokenName = tokenAccount?.mint.symbol ? tokenAccount.mint.symbol : shortAddress(publicKey);
  const isZeroBalance = Boolean(tokenAccount?.balance.lte(0));

  return (
    <Layout
      breadcrumb={{
        currentName: `${tokenName} Wallet`,
        backTo: {
          pathname: `/wallet/${publicKey}`,
          state: { fromPage: location.pathname },
        },
      }}
      rightColumn={
        <TokenSettingsWidget
          publicKey={tokenPublicKey}
          tokenName={tokenName}
          isZeroBalance={isZeroBalance}
        />
      }
    />
  );
};
