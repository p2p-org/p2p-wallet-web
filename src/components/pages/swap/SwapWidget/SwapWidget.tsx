import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { usePoolFromLocation } from 'api/pool/utils/state';
import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';
import { majorAmountToMinor, minorAmountToMajor } from 'utils/amount';

export const SwapWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    firstToken,
    secondToken,
    selectedPool,
    tokenAccounts,
  } = useSelector(tokenPairSelector);

  const feeProperties = useMemo(() => {
    if (selectedPool && firstToken && firstAmount) {
      return {
        amount: selectedPool.impliedFee(firstToken, firstAmount),
        token: selectedPool.otherToken(firstToken),
      };
    }
  }, [selectedPool, firstToken, firstAmount]);

  usePoolFromLocation({
    tokenAccounts,
    updateAction: updateTokenPairState,
  });

  const handleBackClick = () => {
    history.replace('/wallets');
  };

  const handleSubmit = async () => {
    try {
      await dispatch(executeSwap());
    } catch (error) {
      alert(error);
    }
  };

  const handleTokenSelectionChange = (key: 'firstToken' | 'secondToken') => (
    selectedAccountToken: TokenAccount | string,
  ) => {
    let newSelectedAccountToken: TokenAccount = selectedAccountToken as TokenAccount;

    // Change SOL to WSOL in token pair
    if (newSelectedAccountToken?.mint.address.equals(SYSTEM_PROGRAM_ID)) {
      const serialized = newSelectedAccountToken.serialize();

      newSelectedAccountToken = TokenAccount.from({
        ...serialized,
        mint: {
          ...serialized.mint,
          symbol: 'WSOL',
          address: WRAPPED_SOL_MINT.toBase58(),
          isSimulated: true,
        },
      });
    }

    dispatch(
      updateTokenPairState({
        [key]: newSelectedAccountToken.mint.serialize(),
        [`${key}Account`]: newSelectedAccountToken.serialize(),
      }),
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange('firstToken');
  const selectSecondTokenHandleChange = handleTokenSelectionChange('secondToken');

  const updateFirstAmount = (minorAmount: string) => {
    if (!firstToken) {
      return;
    }

    dispatch(
      updateTokenPairState({
        firstAmount: majorAmountToMinor(Number(minorAmount), firstToken).toNumber(),
      }),
    );
  };

  return (
    <SendSwapWidget
      type="swap"
      title="Swap"
      disabled={!selectedPool}
      actionText={selectedPool ? 'Swap' : 'This pair is unavailable'}
      fee={
        feeProperties
          ? minorAmountToMajor(feeProperties.amount, feeProperties.token).toNumber()
          : undefined
      }
      rate={
        selectedPool && secondToken
          ? selectedPool.impliedRate(secondToken, firstAmount).toNumber()
          : undefined
      }
      fromTokenAccount={firstTokenAccount}
      fromAmount={firstToken ? minorAmountToMajor(firstAmount, firstToken).toString() : ''}
      toTokenAccount={secondTokenAccount}
      toAmount={secondToken ? minorAmountToMajor(secondAmount, secondToken).toString() : ''}
      onFromTokenAccountChange={selectFirstTokenHandleChange}
      onFromAmountChange={updateFirstAmount}
      onToTokenAccountChange={selectSecondTokenHandleChange}
      // onToAmountChange={handleToAmountChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
    />
  );
};
