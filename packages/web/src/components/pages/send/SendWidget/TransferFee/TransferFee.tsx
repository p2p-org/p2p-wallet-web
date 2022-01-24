import type { FC } from 'react';
import { useEffect } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@saberhq/token-utils';

import { useSendFees, useSendState } from 'app/contexts';
import { FeeTokenSelector } from 'components/common/FeeTokenSelector';
import { useCompensationSwap } from 'utils/hooks/compensation/useCompensationSwap';

const CompensationSwap: FC<{
  solTokenAmount: TokenAmount;
  feeToken: TokenAccount;
}> = ({ solTokenAmount, feeToken }) => {
  const { setCompensationSwapData, setFeeAmountInToken } = useSendFees();
  const { inputAmount, swapData } = useCompensationSwap(solTokenAmount, feeToken);

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

export const TransferFee: FC = () => {
  const { fromTokenAccount, destinationAccount } = useSendState();
  const { feeToken, setFeeToken, solTokenAmount, feeTokenAmount, feeTokenAccounts } = useSendFees();

  return (
    <>
      {!fromTokenAccount?.balance?.token.isRawSOL &&
      solTokenAmount &&
      solTokenAmount.greaterThan(0) ? (
        <FeeTokenSelector
          feeTokenAccounts={feeTokenAccounts}
          txType="send"
          solFeeAmount={solTokenAmount}
          feeTokenAmount={feeTokenAmount}
          onSelectToken={setFeeToken}
          value={feeToken}
          destinationAccountSymbol={destinationAccount?.symbol}
        />
      ) : undefined}
      {feeToken && !feeToken.balance?.token.isRawSOL && solTokenAmount?.greaterThan(0) ? (
        <CompensationSwap solTokenAmount={solTokenAmount} feeToken={feeToken} />
      ) : undefined}
    </>
  );
};
