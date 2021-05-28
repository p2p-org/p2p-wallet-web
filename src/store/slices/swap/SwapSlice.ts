import { createAsyncThunk } from '@reduxjs/toolkit';

import { APIFactory, SwapParameters } from 'api/pool';
import { Pool } from 'api/pool/Pool';
import { TokenAccount } from 'api/token/TokenAccount';
import { RootState } from 'store/rootReducer';
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
      const result = await PoolAPI.swap(swapParameters);

      swapNotification({
        header: 'Swapped successfuly!',
        status: 'success',
        ...notificationParams,
      });

      return result;
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
