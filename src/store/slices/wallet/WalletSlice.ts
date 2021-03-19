import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
  unwrapResult,
} from '@reduxjs/toolkit';
import { Account, Cluster, PublicKey } from '@solana/web3.js';
import { mergeDeepRight } from 'ramda';

import { APIFactory as TokenAPIFactory, TransferParameters } from 'api/token';
import { AccountListener } from 'api/token/AccountListener';
import { Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import * as WalletAPI from 'api/wallet';
import { getBalance, getWallet, WalletDataType, WalletType } from 'api/wallet';
import { ManualSeedData } from 'api/wallet/ManualWallet';
import { WalletEvent } from 'api/wallet/Wallet';
import { ToastManager } from 'components/common/ToastManager';
import { swapHostFeeAddress } from 'config/constants';
import { SYSTEM_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { RootState } from 'store/rootReducer';
import { getAvailableTokens, wipeAction } from 'store/slices/GlobalSlice';
import { getPools } from 'store/slices/pool/PoolSlice';
import { getRatesCandle, getRatesMarkets } from 'store/slices/rate/RateSlice';
import { updateEntityArray } from 'store/slices/tokenPair/utils/tokenPair';
import {
  loadHiddenTokens,
  loadSettings,
  loadZeroBalanceTokens,
  removeZeroBalanceToken,
  saveSettings,
} from 'utils/settings';
import { WalletSettings } from 'utils/types';

const STORAGE_KEY_TYPE = 'type';
export const STORAGE_KEY_SEED = 'seed';

export const DEFAULT_CLUSTER: Cluster = 'devnet';
export const WALLET_SLICE_NAME = 'wallet';

const accountsListeners: AccountListener[] = [];

export interface WalletsState {
  cluster: Cluster;
  connected: boolean;
  publicKey: string | null;
  type: WalletType;
  tokenAccounts: Array<SerializableTokenAccount>;
  hiddenTokens: Array<string> | null;
  settings: WalletSettings;
  zeroBalanceTokens: Array<string>;
}

/**
 * Async action to disconnect from a wallet.
 */
export const disconnect = createAsyncThunk(`${WALLET_SLICE_NAME}/disconnect`, (_, thunkAPI) => {
  WalletAPI.disconnect();
  thunkAPI.dispatch(wipeAction());
  ToastManager.error('Wallet disconnected');
});

// Simulate SOL token account
const getSolToken = async () => {
  const publicKey = getWallet().pubkey;
  const balance = await getBalance(publicKey);

  // Fake token to simulate SOL as Token
  const mint = new Token(SYSTEM_PROGRAM_ID, 9, 0, undefined, 'Solana', 'SOL');
  return new TokenAccount(mint, SYSTEM_PROGRAM_ID, SYSTEM_PROGRAM_ID, publicKey, balance);
};

export const getTokenAccounts = createAsyncThunk<Array<SerializableTokenAccount>>(
  `${WALLET_SLICE_NAME}/getTokenAccounts`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    // Simulated SOL token
    const solToken = await getSolToken();
    // Get all Tokens
    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    // Merge SOL and Tokens as token accounts
    const tokenAccounts = [solToken, ...accountsForWallet];

    const listener = TokenAPI.listenToTokenAccountChanges(tokenAccounts, (updatedTokenAccount) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      thunkAPI.dispatch(updateAccount(updatedTokenAccount.serialize()));
    });

    accountsListeners.push(listener);

    return tokenAccounts.map((tokenAccount) => tokenAccount.serialize());
  },
);

export const precacheTokenAccounts = createAsyncThunk<void, PublicKey>(
  `${WALLET_SLICE_NAME}/precacheTokenAccounts`,
  async (publicKey, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    await TokenAPI.precacheTokenAccounts(publicKey);
  },
);

export const autoConnect = createAsyncThunk<string | undefined>(
  `${WALLET_SLICE_NAME}/autoConnect`,
  async (_, thunkAPI) => {
    const {
      wallet: { type },
    }: RootState = thunkAPI.getState() as RootState;

    const seed = localStorage.getItem(STORAGE_KEY_SEED)
      ? (JSON.parse(localStorage.getItem(STORAGE_KEY_SEED) as string) as string)
      : null;

    const processedData = type === WalletType.MANUAL ? <ManualSeedData>{ seed } : undefined;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return unwrapResult(await thunkAPI.dispatch(connect(processedData)));
  },
);

/**
 * Async action to connect to a wallet. Creates a new wallet instance,
 * connects to it, and connects action dispatchers, when a disconnect event
 * (e.g. the user closes the wallet tab) occurs.
 *
 * The output of the action is the user's public key in Base58 form,
 * so that the user can verify it.
 */
export const connect = createAsyncThunk<string, WalletDataType | undefined>(
  `${WALLET_SLICE_NAME}/connect`,
  async (data, thunkAPI) => {
    const {
      wallet: { cluster, type },
    }: RootState = thunkAPI.getState() as RootState;

    const wallet = await WalletAPI.connect(cluster, type, data);

    wallet.on(WalletEvent.DISCONNECT, () => {
      void thunkAPI.dispatch(disconnect());
      ToastManager.error('Wallet disconnected');
    });

    wallet.on(WalletEvent.CONFIRMED, ({ transactionSignature }) =>
      ToastManager.info(`Confirmed: ${transactionSignature}`),
    );

    ToastManager.info('Wallet connected');

    // Get tokens first before getting accounts and pools,
    // to avail of the token caching feature
    await thunkAPI.dispatch(getAvailableTokens());
    void thunkAPI.dispatch(getTokenAccounts());
    void thunkAPI.dispatch(getPools());
    void thunkAPI.dispatch(getRatesMarkets());
    void thunkAPI.dispatch(getRatesCandle({ symbol: 'SOL', type: 'month' }));

    if (swapHostFeeAddress) {
      void thunkAPI.dispatch(precacheTokenAccounts(swapHostFeeAddress));
    }

    return wallet.pubkey.toBase58();
  },
);

export const transfer = createAsyncThunk<string, TransferParameters>(
  `${WALLET_SLICE_NAME}/transfer`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    return TokenAPI.transfer(parameters);
  },
);

export const createMint = createAsyncThunk<
  string,
  { amount: number; decimals: number; initialAccount: Account }
>(`${WALLET_SLICE_NAME}/createMint`, async (parameters, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;
  const walletState = state.wallet;
  const TokenAPI = TokenAPIFactory(walletState.cluster);

  return TokenAPI.createMint(parameters.amount, parameters.decimals, parameters.initialAccount);
});

export const createAccountForToken = createAsyncThunk<TokenAccount, { token: Token }>(
  `${WALLET_SLICE_NAME}/createAccountForToken`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    return TokenAPI.createAccountForToken(parameters.token);
  },
);

export const closeTokenAccount = createAsyncThunk<string, { publicKey: PublicKey }>(
  `${WALLET_SLICE_NAME}/closeAccount`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    return TokenAPI.closeAccount(parameters.publicKey);
  },
);

export const airdrop = createAsyncThunk<void>(
  `${WALLET_SLICE_NAME}/airdrop`,
  async (): Promise<void> => {
    await WalletAPI.airdrop();
  },
);

export const getMinimumBalanceForRentExemption = createAsyncThunk<number, number>(
  `${WALLET_SLICE_NAME}/getMinimumBalanceForRentExemption`,
  async (length) => {
    return WalletAPI.getMinimumBalanceForRentExemption(length);
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

  if (token.balance.gte(0) && state.zeroBalanceTokens.includes(token.address.toBase58())) {
    removeZeroBalanceToken(action.payload.address);
  }

  return {
    ...state,
    tokenAccounts: updatedAccounts.map((account) => account.serialize()),
    // eslint-disable-next-line unicorn/prefer-spread
    zeroBalanceTokens: Array.from(loadZeroBalanceTokens()),
  };
};

// The initial wallet state. No wallet is connected yet.
const makeInitialState = (): WalletsState => ({
  cluster: (loadSettings().network.current as Cluster) || DEFAULT_CLUSTER,
  connected: false,
  publicKey: null,
  type: localStorage.getItem(STORAGE_KEY_TYPE)
    ? Number(localStorage.getItem(STORAGE_KEY_TYPE))
    : WalletType.MANUAL,
  tokenAccounts: [],
  // eslint-disable-next-line unicorn/prefer-spread
  hiddenTokens: Array.from(loadHiddenTokens()),
  settings: loadSettings(),
  // eslint-disable-next-line unicorn/prefer-spread
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
    selectCluster: (state, action: PayloadAction<Cluster>) => ({
      ...state,
      cluster: action.payload,
    }),
    selectType: (state, action: PayloadAction<WalletType>) => {
      localStorage.setItem(STORAGE_KEY_TYPE, String(action.payload));

      return {
        ...state,
        type: action.payload,
      };
    },
    updateHiddenTokens: (state) => ({
      ...state,
      // eslint-disable-next-line unicorn/prefer-spread
      hiddenTokens: Array.from(loadHiddenTokens()),
      // eslint-disable-next-line unicorn/prefer-spread
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
    // Triggered when the connect async action is completed
    builder.addCase(connect.fulfilled, (state, action) => ({
      ...makeInitialState(),
      publicKey: action.payload,
      connected: true,
    }));
    // Triggered when the disconnect async action is completed
    builder.addCase(disconnect.fulfilled, () => ({
      ...makeInitialState(),
      publicKey: null,
      connected: false,
    }));
    builder.addCase(getTokenAccounts.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: state.tokenAccounts.concat(action.payload),
    }));
    builder.addCase(createAccountForToken.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: state.tokenAccounts.concat(action.payload.serialize()),
    }));
    builder.addCase(closeTokenAccount.fulfilled, (state, action) => {
      const { publicKey } = action.meta.arg;
      const address = publicKey.toBase58();

      return {
        ...state,
        tokenAccounts: state.tokenAccounts.filter((token) => token.address !== address),
      };
    });
    builder.addCase(wipeAction, (state) => {
      accountsListeners.map((listener) => listener.removeAllListeners());

      return {
        ...state,
        tokenAccounts: [],
      };
    });
  },
});

export const {
  selectCluster,
  selectType,
  updateAccount,
  updateHiddenTokens,
  updateSettings,
} = walletSlice.actions;
// eslint-disable-next-line import/no-default-export
export default walletSlice.reducer;
