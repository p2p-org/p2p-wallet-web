import { useEffect, useMemo, useState } from 'react';

import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { TokenAmount } from '@p2p-wallet-web/token-utils';
import { u64 } from '@solana/spl-token';
import { createContainer } from 'unstated-next';

import { useNetworkFees } from 'app/contexts';
import type { CompensationParams } from 'app/contexts/api/feeRelayer/types';

export type EstimatedFeeAmount = {
  accountsCreation: {
    lamports: u64;
    sol: TokenAmount | undefined;
  };
  totalLamports: u64;
};

export type SEND_TRANSACTION_METHOD = 'blockchain';

export type FeeCompensationState = {
  totalFee: u64;
  estimatedFee: {
    accountRent: u64;
    transactionFee: u64;
  };
  sendMethod: SEND_TRANSACTION_METHOD;
};

const useFeeCompensationInternal = () => {
  const userTokenAccounts = useUserTokenAccounts();
  const networkFees = useNetworkFees();

  const [accountsCount, setAccountsCount] = useState(0);
  const [signaturesCount, setSignaturesCount] = useState(0);

  const [feeToken, setFeeToken] = useState<TokenAccount | null | undefined>(null);
  const [feeAmountInToken, setFeeAmountInToken] = useState<u64>(ZERO);

  const [solTokenAccount] = useMemo(
    () => userTokenAccounts.filter((token) => token.balance?.token.isRawSOL),
    [userTokenAccounts],
  );

  const feeTokenAccounts = useMemo(() => {
    const tokens: TokenAccount[] = [];
    if (solTokenAccount) {
      tokens.push(solTokenAccount);
    }

    return tokens;
  }, [solTokenAccount]);

  const hasFeeToken = useMemo(() => {
    if (!feeToken) {
      return false;
    }

    return feeTokenAccounts.find((t) => t.key?.toBase58() === feeToken.key?.toBase58());
  }, [feeToken, feeTokenAccounts]);

  useEffect(() => {
    if ((!feeToken || !hasFeeToken) && solTokenAccount) {
      setFeeToken(solTokenAccount);
    }
  }, [feeToken, solTokenAccount, hasFeeToken]);

  const accountsCreationLamports = useMemo(() => {
    let total = ZERO;

    if (accountsCount > 0) {
      total = networkFees.accountRentExemption.mul(new u64(accountsCount));
    }

    return new u64(total.toArray());
  }, [accountsCount]);

  const accountsCreationSolAmount = useMemo(() => {
    if (!(solTokenAccount && solTokenAccount.balance)) {
      return undefined;
    }
    return new TokenAmount(solTokenAccount.balance.token, accountsCreationLamports);
  }, [accountsCreationLamports, solTokenAccount]);

  const compensationParams: CompensationParams = useMemo(() => {
    return {
      feeToken,
      feeAmount: accountsCreationLamports,
      feeAmountInToken,
      accountRentExemption: networkFees.accountRentExemption,
    };
  }, [accountsCreationLamports, feeAmountInToken, feeToken, networkFees]);

  const estimatedFeeAmount: EstimatedFeeAmount = useMemo(() => {
    return {
      accountsCreation: {
        lamports: accountsCreationLamports,
        sol: accountsCreationSolAmount,
      },
      totalLamports: accountsCreationLamports,
    };
  }, [accountsCreationLamports, accountsCreationSolAmount]);

  const compensationState: FeeCompensationState = useMemo(() => {
    const state = {
      totalFee: ZERO,
      estimatedFee: {
        accountRent: ZERO,
        transactionFee: ZERO,
      },
      sendMethod: 'blockchain' as SEND_TRANSACTION_METHOD,
    };

    const topUpSignaturesCount = 1; // user signature

    if (accountsCount > 0) {
      const accountRent: u64 = networkFees.accountRentExemption.mul(new u64(accountsCount));
      state.totalFee = state.totalFee.add(accountRent);
      state.estimatedFee.accountRent = accountRent;
    }

    const transactionFee: u64 = networkFees.lamportsPerSignature.mul(new u64(topUpSignaturesCount));
    state.totalFee = state.totalFee.add(transactionFee);
    state.estimatedFee.transactionFee = transactionFee;

    if (signaturesCount > 0) {
      const nextTransactionFee: u64 = networkFees.lamportsPerSignature.mul(
        new u64(signaturesCount),
      );
      state.totalFee = state.totalFee.add(nextTransactionFee);
    }

    return {
      ...state,
      totalFee: new u64(state.totalFee.toArray()),
      estimatedFee: {
        accountRent: new u64(state.estimatedFee.accountRent.toArray()),
        transactionFee: new u64(state.estimatedFee.transactionFee.toArray()),
      },
    };
  }, [accountsCount, networkFees, signaturesCount]);

  return {
    feeToken,
    setFeeToken,
    feeTokenAccounts,
    setFeeAmountInToken,
    feeAmountInToken,
    compensationParams,
    setAccountsCount,
    estimatedFeeAmount,
    compensationState,
    setSignaturesCount,
  };
};

export const { Provider: FeeCompensationProvider, useContainer: useFeeCompensation } =
  createContainer(useFeeCompensationInternal);
