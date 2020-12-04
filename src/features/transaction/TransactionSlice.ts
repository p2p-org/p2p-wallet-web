import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { APIFactory } from 'api/pool';
import { SerializablePool } from 'api/pool/Pool';
import { RootState } from 'store/rootReducer';

const TRANSACTION_SLICE_NAME = 'transaction';

export const getTransactions = createAsyncThunk(
  `${TRANSACTION_SLICE_NAME}/getTransactions`,
  async (arg, { dispatch, getState }): Promise<Array<SerializablePool>> => {
    const state: RootState = getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const pools = await PoolAPI.getTransactions();

    PoolAPI.listenToPoolChanges(pools, (pool) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(transactionSlice.actions.updatePool(pool.serialize()));
    });

    return pools.map((pool) => pool.serialize());
  },
);

interface TransactionsState {
  availablePools: Array<SerializablePool>;
}

const initialState: TransactionsState = {
  availablePools: [],
};

const transactionSlice = createSlice({
  name: TRANSACTION_SLICE_NAME,
  initialState,
  reducers: {
    updatePool: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(getTransactions.fulfilled, (state, action) => ({
      ...state,
      availablePools: action.payload,
    }));
  },
});

// export const { updatePool } = transactionSlice.actions;
// eslint-disable-next-line import/no-default-export
export default transactionSlice.reducer;
