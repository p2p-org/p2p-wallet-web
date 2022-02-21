import { useCallback, useEffect, useMemo, useState } from 'react';

import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { TokenAmount } from '@saberhq/token-utils';
import { u64 } from '@solana/spl-token';
import { createContainer } from 'unstated-next';

import { useFeeRelayer, useFreeFeeLimits, useNetworkFees } from 'app/contexts';
import type {
  CompensationParams,
  CompensationSwapParams,
  UserRelayAccount,
} from 'app/contexts/api/feeRelayer/types';
import { RELAY_ACCOUNT_RENT_EXEMPTION } from 'app/contexts/api/feeRelayer/utils';

export type EstimatedFeeAmount = {
  accountsCreation: {
    lamports: u64;
    sol: TokenAmount | undefined;
    feeToken: TokenAmount | undefined;
  };
  totalLamports: u64;
};

export type SEND_TRANSACTION_METHOD = 'feeRelayer' | 'blockchain';

export type FeeCompensationState = {
  totalFee: u64;
  topUpCompensationFee: u64;
  nextTransactionFee: u64;
  estimatedFee: {
    accountRent: u64;
    transactionFee: u64;
    relayAccountRent: u64;
    nextTransactionFee: u64;
  };
  needTopUp: boolean;
  needCreateRelayAccount: boolean;
  sendMethod: SEND_TRANSACTION_METHOD;
};

const useFeeCompensationInternal = () => {
  const userTokenAccounts = useUserTokenAccounts();
  const { getUserRelayAccount } = useFeeRelayer();
  const networkFees = useNetworkFees();
  const { userFreeFeeLimits } = useFreeFeeLimits();

  const [fromTokenAccount, setFromTokenAccount] = useState<TokenAccount | null | undefined>(null);

  const [accountsCount, setAccountsCount] = useState(0);
  const [signaturesCount, setSignaturesCount] = useState(0);

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

  const setFromToken = useCallback(
    (token: TokenAccount) => {
      setFromTokenAccount(token);
    },
    [setFromTokenAccount],
  );

  useEffect(() => {
    if (feeToken && feeToken.balance?.token.isRawSOL) {
      setCompensationSwapData(null);
    }
  }, [feeToken]);

  useEffect(() => {
    const checkUserRelayAccount = async () => {
      const account = await getUserRelayAccount();
      setUserRelayAccount(account);
    };

    if (!userRelayAccount && accountsCount > 0) {
      void checkUserRelayAccount();
    }
  }, [accountsCount, getUserRelayAccount, userRelayAccount]);

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
      total = networkFees.accountRentExemption.mul(new u64(accountsCount));
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

  const isNeedCompensationSwap = useMemo(() => {
    if (userRelayAccount && userRelayAccount.exist && userRelayAccount.balance) {
      return new u64(userRelayAccount.balance).sub(accountsCreationLamports).lte(ZERO);
    }

    return false;
  }, [accountsCreationLamports, userRelayAccount]);

  const accountsCreationFeeTokenAmount = useMemo(() => {
    if (!(feeToken && feeToken.balance)) {
      return undefined;
    }

    return new TokenAmount(
      feeToken.balance.token,
      isNeedCompensationSwap ? feeAmountInToken : ZERO,
    );
  }, [feeToken, isNeedCompensationSwap, feeAmountInToken]);

  const compensationParams: CompensationParams = useMemo(() => {
    return {
      feeToken,
      feeAmount: accountsCreationLamports,
      feeAmountInToken,
      isRelayAccountExist: !!userRelayAccount?.exist,
      accountRentExemption: networkFees.accountRentExemption,
      isNeedCompensationSwap,
      topUpParams: compensationSwapData,
    };
  }, [
    accountsCreationLamports,
    compensationSwapData,
    feeAmountInToken,
    feeToken,
    isNeedCompensationSwap,
    networkFees,
    userRelayAccount,
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

  const compensationState: FeeCompensationState = useMemo(() => {
    const state = {
      totalFee: ZERO,
      topUpCompensationFee: ZERO,
      nextTransactionFee: ZERO,
      estimatedFee: {
        accountRent: ZERO,
        transactionFee: ZERO,
        relayAccountRent: ZERO,
        nextTransactionFee: ZERO,
      },
      needTopUp: false,
      needCreateRelayAccount: false,
      sendMethod: 'feeRelayer' as SEND_TRANSACTION_METHOD,
    };

    let topUpSignaturesCount = 1; // user signature

    if (!feeToken?.balance?.token.isRawSOL) {
      state.needTopUp = true;
      topUpSignaturesCount += 1; // feeRelayer signature
      state.topUpCompensationFee = state.topUpCompensationFee.add(networkFees.accountRentExemption);
    }

    if (accountsCount > 0) {
      const accountRent: u64 = networkFees.accountRentExemption.mul(new u64(accountsCount));
      state.totalFee = state.totalFee.add(accountRent);
      state.estimatedFee.accountRent = accountRent;

      state.nextTransactionFee = state.nextTransactionFee.add(accountRent);
    }

    if (!userFreeFeeLimits.hasFreeTransactions) {
      const transactionFee: u64 = networkFees.lamportsPerSignature.mul(
        new u64(topUpSignaturesCount),
      );
      state.totalFee = state.totalFee.add(transactionFee);
      state.estimatedFee.transactionFee = transactionFee;
      state.topUpCompensationFee = state.topUpCompensationFee.add(transactionFee);

      if (signaturesCount > 0) {
        const nextTransactionFee: u64 = networkFees.lamportsPerSignature.mul(
          new u64(signaturesCount),
        );
        state.totalFee = state.totalFee.add(nextTransactionFee);
        state.estimatedFee.nextTransactionFee = nextTransactionFee;
        state.nextTransactionFee = state.nextTransactionFee.add(nextTransactionFee);
      }
    }

    if (userRelayAccount && !userRelayAccount.exist) {
      state.totalFee = state.totalFee.add(RELAY_ACCOUNT_RENT_EXEMPTION as u64);
      state.estimatedFee.relayAccountRent = RELAY_ACCOUNT_RENT_EXEMPTION;
      state.needCreateRelayAccount = true;
      state.topUpCompensationFee = state.topUpCompensationFee.add(RELAY_ACCOUNT_RENT_EXEMPTION);
    }

    if (userRelayAccount && userRelayAccount.exist && userRelayAccount.balance) {
      if (new u64(userRelayAccount.balance).sub(state.totalFee).gte(ZERO)) {
        state.needTopUp = false;
        state.topUpCompensationFee = ZERO;
      }
    }

    if (
      (!userFreeFeeLimits.hasFreeTransactions &&
        accountsCount === 0 &&
        feeToken?.balance?.token.isRawSOL) ||
      (!userFreeFeeLimits.hasFreeTransactions && feeToken?.balance?.token.isRawSOL)
    ) {
      state.sendMethod = 'blockchain' as SEND_TRANSACTION_METHOD;
      state.nextTransactionFee = ZERO;
    }

    return {
      ...state,
      totalFee: new u64(state.totalFee.toArray()),
      topUpCompensationFee: new u64(state.topUpCompensationFee.toArray()),
      nextTransactionFee: new u64(state.nextTransactionFee.toArray()),
      estimatedFee: {
        accountRent: new u64(state.estimatedFee.accountRent.toArray()),
        transactionFee: new u64(state.estimatedFee.transactionFee.toArray()),
        relayAccountRent: new u64(state.estimatedFee.relayAccountRent.toArray()),
        nextTransactionFee: new u64(state.estimatedFee.nextTransactionFee.toArray()),
      },
    };
  }, [accountsCount, feeToken, networkFees, signaturesCount, userFreeFeeLimits, userRelayAccount]);

  return {
    feeToken,
    setFeeToken,
    feeTokenAccounts,
    setFeeAmountInToken,
    feeAmountInToken,
    compensationSwapData,
    setCompensationSwapData,
    userRelayAccount,
    compensationParams,
    setFromToken,
    setAccountsCount,
    estimatedFeeAmount,
    isNeedCompensationSwap,
    compensationState,
    setSignaturesCount,
  };
};

export const { Provider: FeeCompensationProvider, useContainer: useFeeCompensation } =
  createContainer(useFeeCompensationInternal);
