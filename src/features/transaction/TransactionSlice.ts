import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import { mergeRight, pathOr, uniq } from 'ramda';

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

export const getTransaction = createAsyncThunk<
  SerializableTransaction | null,
  TransactionSignature
>(`${TRANSACTION_SLICE_NAME}/getTransactions`, async (signature, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;

  const TransactionAPI = APIFactory(state.wallet.cluster);
  const transaction = await TransactionAPI.transactionInfo(signature);

  if (!transaction) {
    return null;
  }

  // PoolAPI.listenToPoolChanges(pools, (pool) => {
  //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
  //   dispatch(transactionSlice.actions.updatePool(pool.serialize()));
  // });

  return transaction.serialize();
});

type ItemsType = {
  [signature: string]: SerializableTransaction;
};

interface TransactionsState {
  items: ItemsType;
  order: {
    [account: string]: string[];
  };
}

const initialState: TransactionsState = {
  items: {},
  order: {},
};

const transactionSlice = createSlice({
  name: TRANSACTION_SLICE_NAME,
  initialState,
  reducers: {
    // updatePool: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(getTransactions.fulfilled, (state, action) => {
      const newItems: ItemsType = {};
      const newPubkeys: string[] = [];

      for (const transaction of action.payload) {
        newItems[transaction.signature] = transaction;
        newPubkeys.push(transaction.signature);
      }

      // eslint-disable-next-line no-param-reassign
      state.items = mergeRight(state.items, newItems);

      // eslint-disable-next-line no-param-reassign
      state.order[action.meta.arg.toBase58()] = uniq(
        pathOr<string[]>([], ['order', action.meta.arg.toBase58()], state).concat(newPubkeys),
      );
    });
  },
});

// export const { updatePool } = transactionSlice.actions;
// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
