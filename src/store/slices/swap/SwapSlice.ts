import { createAsyncThunk } from '@reduxjs/toolkit';

import { APIFactory, SwapParameters } from 'api/pool';
import { Pool } from 'api/pool/Pool';
import { TokenAccount } from 'api/token/TokenAccount';
import { RootState } from 'store/rootReducer';

export const SWAP_SLICE_NAME = 'swap';

export const executeSwap = createAsyncThunk(
  `${SWAP_SLICE_NAME}/executeSwap`,
  async (_, thunkAPI): Promise<string> => {
    try {
      const state: RootState = thunkAPI.getState() as RootState;
      const walletState = state.wallet;
      const {
        firstTokenAccount: serializedFirstTokenAccount,
        firstAmount,
        secondTokenAccount: serializedSecondTokenAccount,
        selectedPool,
        slippage,
      } = state.tokenPair;

      if (!serializedFirstTokenAccount || !selectedPool) {
        return '';
      }

      const swapParameters: SwapParameters = {
        fromAccount: TokenAccount.from(serializedFirstTokenAccount),
        toAccount: serializedSecondTokenAccount && TokenAccount.from(serializedSecondTokenAccount),
        fromAmount:
          firstAmount * 10 ** (TokenAccount.from(serializedFirstTokenAccount).mint.decimals || 0),
        pool: Pool.from(selectedPool),
        slippage,
      };

      const PoolAPI = APIFactory(walletState.cluster);
      return PoolAPI.swap(swapParameters);
    } catch (error) {
      console.error('Something wrong with swap:', error);
      throw error;
    }
  },
);
