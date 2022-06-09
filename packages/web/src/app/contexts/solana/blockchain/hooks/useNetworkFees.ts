import { useEffect } from 'react';

import { ZERO } from '@orca-so/sdk';
import { useConnectionContext } from '@saberhq/use-solana';
import { AccountLayout, u64 } from '@solana/spl-token';

export type NetworkFees = {
  accountRentExemption: u64;
  solAccountRentExemption: u64;
  lamportsPerSignature: u64;
};

const networkFeesCache: NetworkFees = {
  accountRentExemption: ZERO,
  solAccountRentExemption: ZERO,
  lamportsPerSignature: ZERO,
};

export const useNetworkFees = (): NetworkFees => {
  const { connection } = useConnectionContext();

  useEffect(() => {
    const getAccountRentExemption = async () => {
      networkFeesCache.accountRentExemption = new u64(
        await connection.getMinimumBalanceForRentExemption(AccountLayout.span),
      );
    };

    const getSOLAccountRentExemption = async () => {
      networkFeesCache.solAccountRentExemption = new u64(
        await connection.getMinimumBalanceForRentExemption(0),
      );
    };

    const getLamportsPerSignature = async () => {
      const result = await connection.getRecentBlockhash();

      networkFeesCache.lamportsPerSignature = new u64(result.feeCalculator.lamportsPerSignature);
    };

    if (networkFeesCache.accountRentExemption.eq(ZERO)) {
      void getAccountRentExemption();
    }

    if (networkFeesCache.solAccountRentExemption.eq(ZERO)) {
      void getSOLAccountRentExemption();
    }

    if (networkFeesCache.lamportsPerSignature.eq(ZERO)) {
      void getLamportsPerSignature();
    }
  }, [connection]);

  return networkFeesCache;
};
