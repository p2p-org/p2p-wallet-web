import { createAsyncThunk } from '@reduxjs/toolkit';
import { Decimal } from 'decimal.js';

import { APIFactory, SwapParameters } from 'api/pool';
import { Pool } from 'api/pool/Pool';
import { TokenAccount } from 'api/token/TokenAccount';
import { Transaction } from 'api/transaction/Transaction';
import { awaitConfirmation } from 'api/wallet';
import { RootState } from 'store/rootReducer';
import { addPendingTransaction } from 'store/slices/transaction/TransactionSlice';
import { minorAmountToMajor } from 'utils/amount';
import { swapNotification } from 'utils/transactionNotifications';

export const SWAP_SLICE_NAME = 'swap';

export const executeSwap = createAsyncThunk(
  `${SWAP_SLICE_NAME}/executeSwap`,
  async (_, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      firstTokenAccount: serializedFirstTokenAccount,
      firstAmount,
      secondTokenAccount: serializedSecondTokenAccount,
      secondAmount,
      selectedPool,
      slippage,
      firstToken,
      secondToken,
    } = state.tokenPair;

    const symbolA = firstToken?.symbol;
    const symbolB = secondToken?.symbol;

    const notificationParams = {
      text: `${symbolA} to ${symbolB}`,
      symbol: symbolA,
      symbolB,
    };

    try {
      if (!serializedFirstTokenAccount || !selectedPool) {
        return '';
      }

      const swapParameters: SwapParameters = {
        fromAccount: TokenAccount.from(serializedFirstTokenAccount),
        toAccount: serializedSecondTokenAccount && TokenAccount.from(serializedSecondTokenAccount),
        fromAmount: firstAmount,
        pool: Pool.from(selectedPool),
        slippage,
      };

      swapNotification({
        header: 'Swap processing...',
        status: 'processing',
        ...notificationParams,
      });

      const PoolAPI = APIFactory(walletState.network);
      const resultSignature = await PoolAPI.swap(swapParameters);

      thunkAPI.dispatch(
        addPendingTransaction(
          new Transaction(resultSignature, 0, null, null, null, {
            type: 'swap',
            source: swapParameters.fromAccount.address,
            sourceTokenAccount: swapParameters.fromAccount,
            sourceToken: swapParameters.fromAccount.mint,
            destination: swapParameters.toAccount?.address || null,
            destinationTokenAccount: swapParameters.toAccount || null,
            destinationToken: swapParameters.toAccount?.mint || null,
            sourceAmount: minorAmountToMajor(
              swapParameters.fromAmount,
              swapParameters.fromAccount.mint,
            ),
            destinationAmount: swapParameters.toAccount?.mint
              ? minorAmountToMajor(secondAmount, swapParameters.toAccount.mint)
              : new Decimal(0),
          }).serialize(),
        ),
      );

      await awaitConfirmation(resultSignature);

      swapNotification({
        header: 'Swapped successfuly!',
        status: 'success',
        ...notificationParams,
      });

      return resultSignature;
    } catch (error) {
      console.error('Something wrong with swap:', error);

      swapNotification({
        header: 'Swap didn’t complete!',
        status: 'error',
        ...notificationParams,
      });

      throw error;
    }
  },
);
