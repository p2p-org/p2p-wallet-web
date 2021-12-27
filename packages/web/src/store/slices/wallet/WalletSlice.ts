import type { Draft, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

import { APIFactory as TokenAPIFactory } from 'api/token';
import type { RootState } from 'store/rootReducer';
import { updateEntityArray } from 'store/utils';
import { minorAmountToMajor } from 'utils/amount';
import { transferNotification } from 'utils/transactionNotifications';

export const WALLET_SLICE_NAME = 'wallet';

// export const updateTokenAccountsForWallet = createAsyncThunk<SerializableTokenAccount[]>(
//   `${WALLET_SLICE_NAME}/updateTokenAccountsForWallet`,
//   async (_, thunkAPI) => {
//     const state: RootState = thunkAPI.getState() as RootState;
//     const { network, tokenAccounts } = state.wallet;
//     const TokenAPI = TokenAPIFactory(network);
//
//     const accountsForWallet = await TokenAPI.getAccountsForWallet();
//
//     const tokenAccountsAddresses = new Set(tokenAccounts.map((token) => token.address));
//
//     const newTokenAccounts = [];
//
//     for (const account of accountsForWallet) {
//       if (!tokenAccountsAddresses.has(account.address.toBase58())) {
//         newTokenAccounts.push(account);
//
//         const listener = TokenAPI.listenToTokenAccountChanges(
//           newTokenAccounts,
//           (updatedTokenAccount) => {
//             thunkAPI.dispatch(updateAccount(updatedTokenAccount.serialize()));
//           },
//         );
//
//         accountsListeners.push(listener);
//
//         ToastManager.info('Wallet successfully created!');
//
//         const { symbol } = account.mint;
//
//         transferNotification({
//           header: 'Received',
//           text: `+ ${minorAmountToMajor(account.balance, account.mint).toString()} ${symbol}`,
//           symbol,
//         });
//       }
//     }
//
//     return newTokenAccounts.map((tokenAccount) => tokenAccount.serialize());
//   },
// );

export const closeTokenAccount = createAsyncThunk<string, { publicKey: PublicKey }>(
  `${WALLET_SLICE_NAME}/closeAccount`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    return TokenAPI.closeAccount(parameters.publicKey);
  },
);

export const updateAccountReducer = (
  state: Draft<WalletsState>,
  action: PayloadAction<SerializableTokenAccount>,
) => {
  const token = TokenAccount.from(action.payload);
  // find and replace the pool in the list with the pool in the action
  const updatedAccounts = updateEntityArray(
    token,
    state.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  const prevBalance =
    state.tokenAccounts.find((account) => account.mint.symbol === token.mint.symbol)?.balance ||
    new Decimal(0);
  const amount = token.balance.sub(prevBalance);

  if (amount.gt(0)) {
    const { symbol } = token.mint;

    transferNotification({
      header: 'Received',
      text: `+ ${minorAmountToMajor(amount, token.mint).toString()} ${symbol}`,
      symbol,
    });
  }

  return {
    ...state,
    tokenAccounts: updatedAccounts.map((account) => account.serialize()),
  };
};

// The initial wallet state. No wallet is connected yet.
const makeInitialState = (): WalletsState => ({
  tokenAccounts: [],
});

/**
 * Redux slice containing the reducers for the wallet
 */
const walletSlice = createSlice({
  name: WALLET_SLICE_NAME,
  initialState: makeInitialState(),
  reducers: {
    updateAccount: updateAccountReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(closeTokenAccount.fulfilled, (state, action) => {
      const { publicKey } = action.meta.arg;
      const address = publicKey.toBase58();

      return {
        ...state,
        tokenAccounts: state.tokenAccounts.filter((token) => token.address !== address),
      };
    });
  },
});

export const { updateAccount } = walletSlice.actions;
// eslint-disable-next-line import/no-default-export
export default walletSlice.reducer;
