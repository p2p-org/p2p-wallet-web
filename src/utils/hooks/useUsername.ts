import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type Username = {
  username: string | null;
  domain: string;
};

export const useUsername = (): Username => {
  const cluster = useSelector((state) => state.wallet.network.cluster);
  const username = useSelector((state) => state.wallet.username);

  const domain = cluster === 'mainnet-beta' ? '.p2p.sol' : '.p2p';

  return useMemo(() => {
    return {
      username,
      domain,
    };
  }, [domain, username]);
};
