import type { FC } from 'react';
import React from 'react';

import { useWallet, DefaultWalletType } from '@p2p-wallet-web/core';

export const Connect: FC = () => {
  const { publicKey, activate } = useWallet();

  if (publicKey) {
    return <>{publicKey.toBase58()}</>;
  }

  return <button onClick={() => activate(DefaultWalletType.Phantom)}>Connect</button>;
};
