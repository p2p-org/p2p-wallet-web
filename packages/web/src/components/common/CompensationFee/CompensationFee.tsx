import type { FC } from 'react';
import { useEffect } from 'react';

import { ZERO } from '@orca-so/sdk';
import type { TokenAccount } from '@p2p-wallet-web/core';
import type { u64 } from '@saberhq/token-utils';

import { useFeeCompensation } from 'app/contexts';
import { useCompensationSwap } from 'app/contexts/solana/feeCompensation/hooks/useCompensationSwap';

import { FeeTokenSelector } from './FeeTokenSelector';

const CompensationSwap: FC<{
  compensationAmount: u64;
  feeToken: TokenAccount;
}> = ({ compensationAmount, feeToken }) => {
  const { setCompensationSwapData, setFeeAmountInToken } = useFeeCompensation();
  const { inputAmount, swapData } = useCompensationSwap(compensationAmount, feeToken);

  useEffect(() => {
    if (swapData) {
      setCompensationSwapData(swapData);
    }
  }, [setCompensationSwapData, swapData]);

  useEffect(() => {
    if (inputAmount) {
      setFeeAmountInToken(inputAmount);
    }
  }, [setFeeAmountInToken, inputAmount]);

  return null;
};

export const CompensationFee: FC<{
  type: 'send' | 'swap';
  isShow?: boolean;
  accountSymbol?: string;
}> = ({ type, isShow = true, accountSymbol }) => {
  const { feeToken, setFeeToken, feeTokenAccounts, estimatedFeeAmount, compensationState } =
    useFeeCompensation();
  const hasFee = compensationState.totalFee.gt(ZERO);

  if (!isShow || !hasFee) {
    return null;
  }

  return (
    <>
      <FeeTokenSelector
        type={type}
        feeTokenAccounts={feeTokenAccounts}
        feeAmountInSol={estimatedFeeAmount.accountsCreation.sol}
        feeTokenAmount={estimatedFeeAmount.accountsCreation.feeToken}
        onSelectToken={setFeeToken}
        value={feeToken}
        accountSymbol={accountSymbol}
      />
      {feeToken && compensationState.needTopUp ? (
        <CompensationSwap compensationAmount={compensationState.totalFee} feeToken={feeToken} />
      ) : undefined}
    </>
  );
};
