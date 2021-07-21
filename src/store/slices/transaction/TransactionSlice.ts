// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */
import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ConfirmedSignaturesForAddress2Options,
  PublicKey,
  TransactionSignature,
} from '@solana/web3.js';
import { mergeRight, pathOr, uniq } from 'ramda';

import { APIFactory } from 'api/transaction';
import { SerializableTransaction } from 'api/transaction/Transaction';
import { RootState } from 'store/rootReducer';
import { wipeAction } from 'store/slices/GlobalSlice';

const TRANSACTION_SLICE_NAME = 'transaction';

export const addPendingTransaction = createAction<SerializableTransaction>('addPendingTransaction');

export const getTransactions = createAsyncThunk<
  Array<SerializableTransaction>,
  { publicKey: PublicKey; options?: ConfirmedSignaturesForAddress2Options }
>(`${TRANSACTION_SLICE_NAME}/getTransactions`, async ({ publicKey, options }, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;

  const TransactionAPI = APIFactory(state.wallet.network);
  const transactions = await TransactionAPI.getTransactionsForAddress(publicKey, options);

  return transactions.map((transaction) => transaction.serialize());
});

export const getTransaction = createAsyncThunk<
  SerializableTransaction | null,
  TransactionSignature
>(`${TRANSACTION_SLICE_NAME}/getTransaction`, async (signature, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;

  const TransactionAPI = APIFactory(state.wallet.network);
  const transaction = await TransactionAPI.transactionInfo(signature);

  if (!transaction) {
    return null;
  }

  return transaction.serialize();
});

type ItemsType = {
  [signature: string]: SerializableTransaction;
};

export interface TransactionsState {
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

      // keep pending transactions
      if (state.order[action.meta.arg.publicKey.toBase58()]) {
        for (const signature of state.order[action.meta.arg.publicKey.toBase58()]) {
          const transaction = state.items[signature];

          if (!transaction.slot) {
            newPubkeys.push(transaction.signature);
          }
        }
      }

      for (const transaction of action.payload) {
        newItems[transaction.signature] = transaction;
        newPubkeys.push(transaction.signature);
      }

      state.items = mergeRight(state.items, newItems);

      if (action.meta.arg.options?.before) {
        state.order[action.meta.arg.publicKey.toBase58()] = uniq(
          pathOr<string[]>([], ['order', action.meta.arg.publicKey.toBase58()], state).concat(
            newPubkeys,
          ),
        );
      } else {
        state.order[action.meta.arg.publicKey.toBase58()] = newPubkeys;
      }
    });
    builder.addCase(getTransaction.fulfilled, (state, action) => {
      if (!action.payload) {
        return state;
      }

      const newItems: ItemsType = {
        [action.payload.signature]: action.payload,
      };
      const newPubkeys: string[] = [action.payload.signature];
      state.items = mergeRight(state.items, newItems);

      if (action.payload.short.source) {
        state.order[action.payload.short.source] = uniq(
          pathOr<string[]>([], ['order', action.payload.short.source], state).concat(newPubkeys),
        );
      }

      if (action.payload.short.destination) {
        state.order[action.payload.short.destination] = uniq(
          pathOr<string[]>([], ['order', action.payload.short.destination], state).concat(
            newPubkeys,
          ),
        );
      }
    });
    builder.addCase(addPendingTransaction, (state, action) => {
      if (!action.payload) {
        return state;
      }

      const newItems: ItemsType = {
        [action.payload.signature]: action.payload,
      };
      const newPubkeys: string[] = [action.payload.signature];
      state.items = mergeRight(state.items, newItems);

      if (action.payload.short.source) {
        state.order[action.payload.short.source] = uniq(
          newPubkeys.concat(pathOr<string[]>([], ['order', action.payload.short.source], state)),
        );
      }

      if (action.payload.short.destination) {
        state.order[action.payload.short.destination] = uniq(
          newPubkeys.concat(
            pathOr<string[]>([], ['order', action.payload.short.destination], state),
          ),
        );
      }
    });
    builder.addCase(wipeAction, () => initialState);
  },
});

// export const { updatePool } = transactionSlice.actions;
// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
