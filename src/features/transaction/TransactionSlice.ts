import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';

import { APIFactory } from 'api/transaction';
import { SerializableTransaction } from 'api/transaction/Transaction';
import { RootState } from 'store/rootReducer';

const TRANSACTION_SLICE_NAME = 'transaction';

export const getTransactions = createAsyncThunk<Array<SerializableTransaction>, PublicKey>(
  `${TRANSACTION_SLICE_NAME}/getTransactions`,
  async (publicKey, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    const TransactionAPI = APIFactory(state.wallet.cluster);
    const transactions = await TransactionAPI.getTransactionsForAddress(publicKey);

    // PoolAPI.listenToPoolChanges(pools, (pool) => {
    //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
    //   dispatch(transactionSlice.actions.updatePool(pool.serialize()));
    // });

    return transactions.map((transaction) => transaction.serialize());
  },
);

interface TransactionsState {
  [signature: string]: Array<SerializableTransaction>;
}

const initialState: TransactionsState = {};

const transactionSlice = createSlice({
  name: TRANSACTION_SLICE_NAME,
  initialState,
  reducers: {
    // updatePool: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(getTransactions.fulfilled, (state, action) => ({
      ...state,
      [action.meta.arg.toBase58()]: action.payload,
    }));
  },
});

// export const { updatePool } = transactionSlice.actions;
// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
