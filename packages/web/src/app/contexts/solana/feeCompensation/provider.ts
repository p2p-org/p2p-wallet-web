import { useCallback, useEffect, useMemo, useState } from 'react';

import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { TokenAmount } from '@saberhq/token-utils';
import { useConnectionContext } from '@saberhq/use-solana';
import { AccountLayout, u64 } from '@solana/spl-token';
import { createContainer } from 'unstated-next';

import { useFeeRelayer } from 'app/contexts';
import type {
  CompensationParams,
  CompensationSwapParams,
  UserRelayAccount,
} from 'app/contexts/api/feeRelayer/types';
import { RELAY_ACCOUNT_RENT_EXEMPTION } from 'app/contexts/api/feeRelayer/utils';

type NetworkFees = {
  accountRentExemption: number;
  lamportsPerSignature: number;
};

const networkFeesCache: NetworkFees = {
  accountRentExemption: 0,
  lamportsPerSignature: 0,
};

export type EstimatedFeeAmount = {
  accountsCreation: {
    lamports: u64;
    sol: TokenAmount | undefined;
    feeToken: TokenAmount | undefined;
  };
  totalLamports: u64;
};

const useFeeCompensationInternal = () => {
  const { connection } = useConnectionContext();
  const userTokenAccounts = useUserTokenAccounts();
  const { getUserRelayAccount } = useFeeRelayer();

  const [fromTokenAccount, setFromTokenAccount] = useState<TokenAccount | null | undefined>(null);

  const [accountsCount, setAccountsCount] = useState(0);

  const [feeToken, setFeeToken] = useState<TokenAccount | null | undefined>(null);
  const [feeAmountInToken, setFeeAmountInToken] = useState<u64>(ZERO);

  const [compensationSwapData, setCompensationSwapData] = useState<CompensationSwapParams | null>(
    null,
  );

  const [userRelayAccount, setUserRelayAccount] = useState<UserRelayAccount | null>(null);

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );

  useEffect(() => {
    const getAccountRentExemption = async () => {
      networkFeesCache.accountRentExemption = await connection.getMinimumBalanceForRentExemption(
        AccountLayout.span,
      );
    };

    if (!networkFeesCache.accountRentExemption) {
      void getAccountRentExemption();
    }
  }, [connection]);

  const setFromToken = useCallback(
    (token: TokenAccount) => {
      setFromTokenAccount(token);
    },
    [setFromTokenAccount],
  );

  useEffect(() => {
    const checkUserRelayAccount = async () => {
      const account = await getUserRelayAccount();
      setUserRelayAccount(account);
    };

    if (!userRelayAccount) {
      void checkUserRelayAccount();
    }
  }, [getUserRelayAccount, userRelayAccount]);

  const feeTokenAccounts = useMemo(() => {
    const tokens: TokenAccount[] = [];
    if (solTokenAccount) {
      tokens.push(solTokenAccount);
    }

    for (const tokenAccount of userTokenAccounts) {
      if (!tokenAccount.key) {
        continue;
      }

      if (fromTokenAccount?.key?.equals(tokenAccount.key)) {
        tokens.push(tokenAccount);
      }
    }

    return tokens;
  }, [fromTokenAccount, solTokenAccount, userTokenAccounts]);

  const hasFeeToken = useMemo(() => {
    if (!feeToken) {
      return false;
    }

    return feeTokenAccounts.find((t) => t.key?.toBase58() === feeToken.key?.toBase58());
  }, [feeToken, feeTokenAccounts]);

  useEffect(() => {
    if (!feeToken || !hasFeeToken) {
      setFeeToken(fromTokenAccount);
    }
  }, [feeToken, fromTokenAccount, hasFeeToken]);

  const isPayInSol = feeToken?.balance?.token.isRawSOL;

  const accountsCreationLamports = useMemo(() => {
    let total = ZERO;

    if (accountsCount > 0) {
      total = new u64(networkFeesCache.accountRentExemption).mul(new u64(accountsCount));
    }

    if (!isPayInSol && userRelayAccount && !userRelayAccount.exist) {
      total = total.add(RELAY_ACCOUNT_RENT_EXEMPTION as u64);
    }

    return new u64(total.toArray());
  }, [accountsCount, isPayInSol, userRelayAccount]);

  const accountsCreationSolAmount = useMemo(() => {
    if (!(solTokenAccount && solTokenAccount.balance)) {
      return undefined;
    }
    return new TokenAmount(solTokenAccount.balance.token, accountsCreationLamports);
  }, [accountsCreationLamports, solTokenAccount]);

  const accountsCreationFeeTokenAmount = useMemo(() => {
    if (!(feeToken && feeToken.balance)) {
      return undefined;
    }

    return new TokenAmount(feeToken.balance.token, feeAmountInToken);
  }, [feeToken, feeAmountInToken]);

  const compensationParams: CompensationParams = useMemo(() => {
    return {
      feeToken,
      feeAmount: accountsCreationLamports,
      feeAmountInToken,
      isRelayAccountExist: !!userRelayAccount?.exist,
      accountRentExemption: new u64(networkFeesCache.accountRentExemption),
      topUpParams: compensationSwapData,
    };
  }, [
    accountsCreationLamports,
    compensationSwapData,
    feeAmountInToken,
    feeToken,
    userRelayAccount?.exist,
  ]);

  const estimatedFeeAmount: EstimatedFeeAmount = useMemo(() => {
    return {
      accountsCreation: {
        lamports: accountsCreationLamports,
        sol: accountsCreationSolAmount,
        feeToken: accountsCreationFeeTokenAmount,
      },
      totalLamports: accountsCreationLamports,
    };
  }, [accountsCreationLamports, accountsCreationSolAmount, accountsCreationFeeTokenAmount]);

  return {
    feeToken,
    setFeeToken,
    feeTokenAccounts,
    setFeeAmountInToken,
    compensationSwapData,
    setCompensationSwapData,
    userRelayAccount,
    compensationParams,
    setFromToken,
    setAccountsCount,
    estimatedFeeAmount,
  };
};

export const { Provider: FeeCompensationProvider, useContainer: useFeeCompensation } =
  createContainer(useFeeCompensationInternal);
