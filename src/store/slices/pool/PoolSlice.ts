import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { APIFactory } from 'api/pool';
import { Pool, SerializablePool } from 'api/pool/Pool';
import { PoolListener } from 'api/pool/PoolListener';
import { RootState } from 'store/rootReducer';
import { wipeAction } from 'store/slices/GlobalSlice';
import { updateEntityArray } from 'store/slices/tokenPair/utils/tokenPair';

export interface PoolsState {
  availablePools: Array<SerializablePool>;
}

export const POOL_SLICE_NAME = 'pool';

const poolsListeners: PoolListener[] = [];

export const getPools = createAsyncThunk(
  `${POOL_SLICE_NAME}/getPools`,
  async (_, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.network);
    const pools = await PoolAPI.getPools();
    /*
    const listener = PoolAPI.listenToPoolChanges(pools, (pool) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      thunkAPI.dispatch(poolSlice.actions.updatePool(pool.serialize()));
    });

    poolsListeners.push(listener);
    */
    return pools.map((pool) => pool.serialize());
  },
);

export const updatePools = createAsyncThunk(
  `${POOL_SLICE_NAME}/updatePools`,
  async (_, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.network);
    const oldPools = state.pool.availablePools.map((pool) => Pool.from(pool));
    const pools = await PoolAPI.updatePools(oldPools);

    return pools.map((pool) => pool.serialize());
  },
);

const updatePoolReducer = (state: Draft<PoolsState>, action: PayloadAction<SerializablePool>) => {
  // find and replace the pool in the list with the pool in the action
  const updatedPools = updateEntityArray(
    Pool.from(action.payload),
    state.availablePools.map((pool) => Pool.from(pool)),
  );

  return {
    ...state,
    availablePools: updatedPools.map((pool) => pool.serialize()),
  };
};

const initialState: PoolsState = {
  availablePools: [],
};

const poolSlice = createSlice({
  name: POOL_SLICE_NAME,
  initialState,
  reducers: {
    updatePool: updatePoolReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(getPools.fulfilled, (state, action) => ({
      ...state,
      availablePools: action.payload,
    }));
    builder.addCase(updatePools.fulfilled, (state, action) => ({
      ...state,
      availablePools: action.payload,
    }));
    builder.addCase(wipeAction, () => {
      poolsListeners.map((listener) => listener.removeAllListeners());

      return initialState;
    });
  },
});

export const { updatePool } = poolSlice.actions;
// eslint-disable-next-line import/no-default-export
export default poolSlice.reducer;
