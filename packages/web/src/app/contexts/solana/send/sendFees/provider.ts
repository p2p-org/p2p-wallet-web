import { useEffect, useMemo, useState } from 'react';

import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { TokenAmount } from '@saberhq/token-utils';
import { useConnectionContext } from '@saberhq/use-solana';
import { AccountLayout, u64 } from '@solana/spl-token';
import { createContainer } from 'unstated-next';

import { RELAY_ACCOUNT_RENT_EXEMPTION, useFeeRelayer, useSendState } from 'app/contexts';
import type { CompensationSwapParams, UserRelayAccount } from 'app/contexts/api/feeRelayer/types';

export type SendFees = {
  accountCreationFee: u64;
  networkFee: u64;
  userRelayAccountCreation: u64;
};

export type NetworkFees = {
  accountRentExemption: number;
  lamportsPerSignature: number;
};

const networkFeesCache: NetworkFees = {
  accountRentExemption: 0,
  lamportsPerSignature: 0,
};

const useSendFeesInternal = () => {
  const { fromTokenAccount, destinationAccount } = useSendState();
  const { connection } = useConnectionContext();
  const userTokenAccounts = useUserTokenAccounts();
  const { getUserRelayAccount } = useFeeRelayer();

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

  const sendFees = useMemo(
    () => ({
      accountCreationFee: destinationAccount?.isNeedCreate
        ? new u64(networkFeesCache.accountRentExemption)
        : ZERO,
      networkFee: ZERO,
    }),
    [destinationAccount?.isNeedCreate],
  );

  const solTokenAmount = useMemo(() => {
    if (!(solTokenAccount && solTokenAccount.balance)) {
      return undefined;
    }
    let total = sendFees.accountCreationFee.add(sendFees.networkFee);

    if (!feeToken?.balance?.token.isRawSOL && !userRelayAccount?.exist) {
      total = total.add(RELAY_ACCOUNT_RENT_EXEMPTION as u64);
    }

    // if (
    //   !feeToken?.balance?.token.isRawSOL &&
    //   compensationSwapData &&
    //   (compensationSwapData as SwapTransitiveParams).SplTransitive
    // ) {
    //   total = total.add(sendFees.accountCreationFee);
    // }

    return new TokenAmount(solTokenAccount.balance?.token, total);
  }, [
    // compensationSwapData,
    feeToken?.balance?.token.isRawSOL,
    sendFees.accountCreationFee,
    sendFees.networkFee,
    solTokenAccount,
    userRelayAccount,
  ]);

  const feeTokenAmount = useMemo(() => {
    if (!(feeToken && feeToken.balance)) {
      return undefined;
    }

    return new TokenAmount(feeToken.balance?.token, feeAmountInToken);
  }, [feeToken, feeAmountInToken]);

  const compensation = useMemo(() => {
    return {
      feeToken,
      compensationAmount: solTokenAmount?.toU64(),
      sourceAmount: feeTokenAmount?.toU64(),
      needCreateUserRalayAccount: !userRelayAccount?.exist,
      topUpParams: compensationSwapData,
    };
  }, [compensationSwapData, feeToken, feeTokenAmount, solTokenAmount, userRelayAccount]);

  return {
    feeToken,
    setFeeToken,
    feeTokenAccounts,
    solTokenAmount,
    feeTokenAmount,
    setFeeAmountInToken,
    compensationSwapData,
    setCompensationSwapData,
    userRelayAccount,
    compensation,
  };
};

export const { Provider: SendFeesProvider, useContainer: useSendFees } =
  createContainer(useSendFeesInternal);
