/*const CompensationSwap: FC<{
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
};*/

/*
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

  return null;

  return (
    <>
      <FeeTokenSelector
        type={type}
        feeTokenAccounts={feeTokenAccounts}
        feeAmountInSol={estimatedFeeAmount.accountsCreation.sol}
        onSelectToken={setFeeToken}
        value={feeToken}
        accountSymbol={accountSymbol}
      />
      {feeToken && compensationState.needTopUp
        ? <CompensationSwap compensationAmount={compensationState.totalFee} feeToken={feeToken} />
        : null}
    </>
  );
};
*/
