import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

// import { APIFactory as IdentityAPIFactory } from 'api/identity';
import { APIFactory } from 'api/pool';
import { Pool, SerializablePool } from 'api/pool/Pool';
import { updateEntityArray } from 'features/tokenPair/utils/tokenPair';
// import { APIFactory as TokenAPIFactory } from 'api/token';
// import * as WalletAPI from 'api/wallet';
// import { getOwnedTokenAccounts } from 'features/wallet/WalletSlice';
import { RootState } from 'store/rootReducer';

interface PoolsState {
  availablePools: Array<SerializablePool>;
}

export const POOL_SLICE_NAME = 'pool';

export const getPools = createAsyncThunk(
  `${POOL_SLICE_NAME}/getPools`,
  async (_, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const pools = await PoolAPI.getPools();

    PoolAPI.listenToPoolChanges(pools, (pool) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      thunkAPI.dispatch(poolSlice.actions.updatePool(pool.serialize()));
    });

    return pools.map((pool) => pool.serialize());
  },
);

// Airdrop tokens to the wallet, if an airdrop key is available.
// This is useful in order to demo token swaps on "dummy tokens" in non-mainnet environments
// export const airdrop = createAsyncThunk<void, Pool>(
//   `${POOL_SLICE_NAME}/airdrop`,
//   async (pool, thunkAPI): Promise<void> => {
//     const state: RootState = thunkAPI.getState() as RootState;
//
//     const TokenAPI = TokenAPIFactory(state.wallet.cluster);
//     const IdentityAPI = IdentityAPIFactory(state.wallet.cluster);
//
//     // airdrop 10 of both tokens (calculated using the following formula: 10 * (10 ^ decimals))
//     const amountA = 10 ** (pool.tokenA.mint.decimals + 1);
//     const amountB = 10 ** (pool.tokenB.mint.decimals + 1);
//
//     // airdrop to the wallet and IDV to ensure both (especially the IDV) stay funded. (DEMO MODE ONLY)
//     // do the wallet airdrop first to ensure it has SOL to create token accounts
//     await WalletAPI.airdrop();
//
//     const airdropSolIDVPromise = WalletAPI.airdropTo(IdentityAPI.dummyIDV.publicKey);
//     const airdropAPromise = TokenAPI.airdropToWallet(pool.tokenA.mint, amountA);
//     const airdropBPromise = TokenAPI.airdropToWallet(pool.tokenB.mint, amountB);
//
//     await Promise.all([airdropSolIDVPromise, airdropAPromise, airdropBPromise]);
//     void thunkAPI.dispatch(getOwnedTokenAccounts());
//   },
// );

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
  },
});

export const { updatePool } = poolSlice.actions;
// eslint-disable-next-line import/no-default-export
export default poolSlice.reducer;
