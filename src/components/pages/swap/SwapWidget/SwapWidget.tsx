import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { usePoolFromLocation } from 'api/pool/utils/state';
import { TokenAccount } from 'api/token/TokenAccount';
import { SendSwapWidget } from 'components/common/SendSwapWidget';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { executeSwap } from 'store/slices/swap/SwapSlice';
import { updateTokenPairState } from 'store/slices/tokenPair/TokenPairSlice';
import { tokenPairSelector } from 'store/slices/tokenPair/utils/tokenPair';

type Props = {
  publicKey: string;
};

export const SwapWidget: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    firstToken,
    selectedPool,
    tokenAccounts,
  } = useSelector(tokenPairSelector);

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
    dispatch(updateTokenPairState({ firstAmount: Number(minorAmount) }));
  };

  const fee =
    selectedPool && firstToken && firstAmount
      ? selectedPool.impliedFee(firstToken, firstAmount)
      : undefined;

  return (
    <SendSwapWidget
      type="swap"
      title="Swap"
      disabled={!selectedPool}
      actionText={selectedPool ? 'Swap' : 'This pair is unavailable'}
      fee={fee}
      fromTokenAccount={firstTokenAccount}
      fromAmount={firstAmount.toString()}
      toTokenAccount={secondTokenAccount}
      toAmount={secondAmount.toString()}
      onFromTokenAccountChange={selectFirstTokenHandleChange}
      onFromAmountChange={updateFirstAmount}
      onToTokenAccountChange={selectSecondTokenHandleChange}
      // onToAmountChange={handleToAmountChange}
      onBackClick={handleBackClick}
      onSubmit={handleSubmit}
    />
  );
};
