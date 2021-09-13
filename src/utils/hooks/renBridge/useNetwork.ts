import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RenNetwork } from '@renproject/interfaces';

export const useRenNetwork = (): RenNetwork => {
  const cluster = useSelector((state) => state.wallet.network.cluster);
  return useMemo(() => {
    return cluster === 'mainnet-beta' ? RenNetwork.Mainnet : RenNetwork.Testnet;
  }, [cluster]);
};
