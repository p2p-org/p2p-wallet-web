import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_SLIPPAGE, Pool, SerializablePool } from 'api/pool/Pool';
import { Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { TokenPairState } from 'utils/types';

import { getPools, updatePool } from '../pool/PoolSlice';
import { getTokenAccounts, updateAccount } from '../wallet/WalletSlice';
import {
  getToAmount,
  selectPoolForTokenPair,
  selectTokenAccount,
  syncPools,
  syncTokenAccount,
  syncTokenAccounts,
  updateEntityArray,
} from './utils/tokenPair';

const initialState: TokenPairState = {
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  availablePools: [],
  slippage: DEFAULT_SLIPPAGE,
};

export const TOKEN_PAIR_SLICE_NAME = 'tokenPair';

const normalize = (tokenPairState: TokenPairState): TokenPairState => {
  const firstTokenAccount = syncTokenAccount(
    tokenPairState.tokenAccounts,
    tokenPairState.firstTokenAccount,
  );
  const secondTokenAccount = syncTokenAccount(
    tokenPairState.tokenAccounts,
    tokenPairState.secondTokenAccount,
  );

  const selectedPool = selectPoolForTokenPair(
    tokenPairState.availablePools,
    tokenPairState.firstToken,
    tokenPairState.secondToken,
  );

  const poolTokenAccount = selectedPool
    ? selectTokenAccount(
        Token.from(selectedPool.poolToken),
        tokenPairState.tokenAccounts.map((account) => TokenAccount.from(account)),
        false,
      )
    : undefined;

  const secondAmount = getToAmount(
    tokenPairState.firstAmount,
    tokenPairState.firstToken,
    selectedPool,
  );

  return {
    ...tokenPairState,
    secondAmount,
    selectedPool,
    firstTokenAccount,
    secondTokenAccount,
    poolTokenAccount: poolTokenAccount?.serialize(),
  };
};

const updateAccountReducer = (
  state: Draft<TokenPairState>,
  action: PayloadAction<SerializableTokenAccount>,
) => {
  let serializedTokenAccount = action.payload;

  // Change SOL to WSOL in token pair
  if (serializedTokenAccount.mint.address === SYSTEM_PROGRAM_ID.toBase58()) {
    serializedTokenAccount = {
      ...serializedTokenAccount,
      mint: {
        ...serializedTokenAccount.mint,
        symbol: 'WSOL',
        address: WRAPPED_SOL_MINT.toBase58(),
        isSimulated: true,
      },
    };
  }

  // find and replace the pool in the list with the pool in the action
  const updatedAccounts = updateEntityArray(
    TokenAccount.from(serializedTokenAccount),
    state.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  return normalize({
    ...state,
    tokenAccounts: updatedAccounts.map((account) => account.serialize()),
  });
};

const updatePoolReducer = (
  state: Draft<TokenPairState>,
  action: PayloadAction<SerializablePool>,
) => {
  const updatedPools = updateEntityArray(
    Pool.from(action.payload),
    state.availablePools.map((pool) => Pool.from(pool)),
  );
  return normalize({
    ...state,
    availablePools: updatedPools.map((pool) => pool.serialize()),
  });
};

const tokenPairSlice = createSlice({
  name: TOKEN_PAIR_SLICE_NAME,
  initialState,
  reducers: {
    updateTokenPairState: (state, action: PayloadAction<Partial<TokenPairState>>) =>
      normalize({
        ...state,
        ...action.payload,
      }),
  },
  extraReducers: (builder) => {
    builder.addCase(getTokenAccounts.fulfilled, (state, action) =>
      syncTokenAccounts(state, action.payload),
    );
    builder.addCase(getPools.fulfilled, (state, action) => syncPools(state, action.payload));

    builder.addCase(updatePool, updatePoolReducer);
    builder.addCase(updateAccount, updateAccountReducer);
  },
});

export const { updateTokenPairState } = tokenPairSlice.actions;
// eslint-disable-next-line import/no-default-export
export default tokenPairSlice.reducer;
