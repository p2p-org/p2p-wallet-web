import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useConnectionContext } from '@p2p-wallet-web/core';

export type Username = {
  username: string | null;
  domain: string;
};

export const useUsername = (): Username => {
  const { network } = useConnectionContext();
  const username = useSelector((state) => state.wallet.username);

  const domain = network === 'mainnet-beta' ? '.p2p.sol' : '.p2p';

  return useMemo(() => {
    return {
      username,
      domain,
    };
  }, [domain, username]);
};
