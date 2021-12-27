import { useMemo } from 'react';

import { useConnectionContext } from '@p2p-wallet-web/core';

import { useNameService } from '../provider';

export type Username = {
  username: string | null | undefined;
  domain: string;
};

export const useUsername = (): Username => {
  const { network } = useConnectionContext();
  const { username } = useNameService();

  const domain = network === 'mainnet-beta' ? '.p2p.sol' : '.p2p';

  return useMemo(() => {
    return {
      username,
      domain,
    };
  }, [domain, username]);
};
