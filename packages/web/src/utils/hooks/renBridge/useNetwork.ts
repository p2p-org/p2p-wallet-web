import { useMemo } from 'react';

import { useConnectionContext } from '@p2p-wallet-web/core';
import { RenNetwork } from '@renproject/interfaces';

export const useRenNetwork = (): RenNetwork => {
  const { network } = useConnectionContext();

  return useMemo(() => {
    return network === 'mainnet-beta' ? RenNetwork.Mainnet : RenNetwork.Testnet;
  }, [network]);
};
