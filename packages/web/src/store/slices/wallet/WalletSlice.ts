import type { Draft, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Blockhash, FeeCalculator, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { mergeDeepRight } from 'ramda';

import { APIFactory as FeeRelayerAPIFactory } from 'api/feeRelayer';
import type { TransferParameters } from 'api/token';
import { APIFactory as TokenAPIFactory } from 'api/token';
import type { SerializableTokenAccount } from 'api/token/TokenAccount';
import { TokenAccount } from 'api/token/TokenAccount';
import { Transaction } from 'api/transaction/Transaction';
import * as WalletAPI from 'api/wallet';
import { awaitConfirmation } from 'api/wallet';
import type { RootState } from 'store/rootReducer';
import { addPendingTransaction } from 'store/slices/transaction/TransactionSlice';
import { updateEntityArray } from 'store/utils';
import { minorAmountToMajor } from 'utils/amount';
import {
  loadHiddenTokens,
  loadSettings,
  loadZeroBalanceTokens,
  removeZeroBalanceToken,
  saveSettings,
} from 'utils/settings';
import { transferNotification } from 'utils/transactionNotifications';
import type { WalletSettings } from 'utils/types';

export const WALLET_SLICE_NAME = 'wallet';

export interface WalletsState {
  tokenAccounts: Array<SerializableTokenAccount>;
  hiddenTokens: Array<string> | null;
  settings: WalletSettings;
  zeroBalanceTokens: Array<string>;
}

export const getTokenAccount = createAsyncThunk<TokenAccount | null, PublicKey>(
  `${WALLET_SLICE_NAME}/getTokenAccount`,
  async (account, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    return TokenAPI.tokenAccountInfo(account);
  },
);

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

/**
 * Async action to connect to a wallet. Creates a new wallet instance,
 * connects to it, and connects action dispatchers, when a disconnect event
 * (e.g. the user closes the wallet tab) occurs.
 *
 * The output of the action is the user's public key in Base58 form,
 * so that the user can verify it.
 */
// export const connectWallet = createAsyncThunk<string, WalletDataType | undefined>(
//   `${WALLET_SLICE_NAME}/connectWallet`,
//   async (data, thunkAPI) => {
//     const {
//       wallet: { network, type },
//     }: RootState = thunkAPI.getState() as RootState;
//
//     const wallet = await WalletAPI.connectWallet(network, type, data);
//
//     wallet.on(WalletEvent.DISCONNECT, () => {
//       void thunkAPI.dispatch(disconnect());
//       ToastManager.error('Wallet disconnected');
//     });
//
//     // wallet.on(WalletEvent.CONFIRMED, ({ transactionSignature }) =>
//     //   ToastManager.info(`Confirmed: ${transactionSignature}`),
//     // );
//
//     ToastManager.info('Wallet connected');
//
//
//     if (swapHostFeeAddress) {
//       void thunkAPI.dispatch(precacheTokenAccounts(swapHostFeeAddress));
//     }
//
//     return wallet.pubkey.toBase58();
//   },
// );

export const transfer = createAsyncThunk<string, TransferParameters>(
  `${WALLET_SLICE_NAME}/transfer`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const tokenAccounts = state.wallet.tokenAccounts.map((account) => TokenAccount.from(account));
    const tokenAccount = tokenAccounts.find((account) => account.address.equals(parameters.source));

    let resultSignature: string;
    if (walletState.settings.useFreeTransactions) {
      const FeeRelayerAPI = FeeRelayerAPIFactory(walletState.network);
      resultSignature = await FeeRelayerAPI.transfer(parameters, tokenAccount);
    } else {
      const TokenAPI = TokenAPIFactory(walletState.network);
      resultSignature = await TokenAPI.transfer(parameters);
    }

    thunkAPI.dispatch(
      addPendingTransaction(
        new Transaction(resultSignature, 0, null, null, null, {
          type: 'transfer',
          source: parameters.source,
          sourceTokenAccount: tokenAccount || null,
          sourceToken: tokenAccount?.mint || null,
          destination: parameters.destination,
          destinationTokenAccount: null,
          destinationToken: tokenAccount?.mint || null,
          sourceAmount: tokenAccount?.mint
            ? minorAmountToMajor(parameters.amount, tokenAccount?.mint)
            : new Decimal(0),
          destinationAmount: tokenAccount?.mint
            ? minorAmountToMajor(parameters.amount, tokenAccount?.mint)
            : new Decimal(0),
        }).serialize(),
      ),
    );

    await awaitConfirmation(resultSignature);

    return resultSignature;
  },
);

export const closeTokenAccount = createAsyncThunk<string, { publicKey: PublicKey }>(
  `${WALLET_SLICE_NAME}/closeAccount`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    return TokenAPI.closeAccount(parameters.publicKey);
  },
);

export const getMinimumBalanceForRentExemption = createAsyncThunk<number, number>(
  `${WALLET_SLICE_NAME}/getMinimumBalanceForRentExemption`,
  async (length) => {
    return WalletAPI.getMinimumBalanceForRentExemption(length);
  },
);

export const getRecentBlockhash = createAsyncThunk<{
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
}>(`${WALLET_SLICE_NAME}/getRecentBlockhash`, async () => {
  return WalletAPI.getRecentBlockhash();
});

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

  if (token.balance.gte(0) && state.zeroBalanceTokens.includes(token.address.toBase58())) {
    removeZeroBalanceToken(action.payload.address);
  }

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
    zeroBalanceTokens: Array.from(loadZeroBalanceTokens()),
  };
};

// The initial wallet state. No wallet is connected yet.
const makeInitialState = (): WalletsState => ({
  tokenAccounts: [],
  hiddenTokens: Array.from(loadHiddenTokens()),
  settings: loadSettings(),
  zeroBalanceTokens: Array.from(loadZeroBalanceTokens()),
});

/**
 * Redux slice containing the reducers for the wallet
 */
const walletSlice = createSlice({
  name: WALLET_SLICE_NAME,
  initialState: makeInitialState(),
  reducers: {
    updateAccount: updateAccountReducer,
    updateHiddenTokens: (state) => ({
      ...state,
      hiddenTokens: Array.from(loadHiddenTokens()),
      zeroBalanceTokens: Array.from(loadZeroBalanceTokens()),
    }),
    updateSettings: (state, action: PayloadAction<Partial<WalletSettings>>) => {
      const newSettings = mergeDeepRight(state.settings, action.payload);

      saveSettings(newSettings);

      return {
        ...state,
        settings: newSettings,
      };
    },
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

export const { updateAccount, updateHiddenTokens, updateSettings } = walletSlice.actions;
// eslint-disable-next-line import/no-default-export
export default walletSlice.reducer;
