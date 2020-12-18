import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Account, Cluster, PublicKey } from '@solana/web3.js';

import { APIFactory as TokenAPIFactory, TransferParameters } from 'api/token';
import { Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import * as WalletAPI from 'api/wallet';
import { getBalance, WalletDataType, WalletType } from 'api/wallet';
import { WalletEvent } from 'api/wallet/Wallet';
import { ToastManager } from 'components/common/ToastManager';
import { SYSTEM_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { RootState } from 'store/rootReducer';
// import { notifyTransaction } from '../../components/notify';
import { getAvailableTokens } from 'store/slices/GlobalSlice';
import { getPools } from 'store/slices/pool/PoolSlice';
import { getCandleRates, getMarketsRates } from 'store/slices/rate/RateSlice';
import { updateEntityArray } from 'store/slices/tokenPair/utils/tokenPair';

const CLUSTER_STORAGE_KEY = 'cluster';
export const DEFAULT_CLUSTER: Cluster = 'devnet';
export const WALLET_SLICE_NAME = 'wallet';

export interface WalletsState {
  cluster: Cluster;
  connected: boolean;
  publicKey: string | null;
  type: WalletType;
  tokenAccounts: Array<SerializableTokenAccount>;
}

/**
 * Async action to disconnect from a wallet.
 */
export const disconnect = createAsyncThunk(`${WALLET_SLICE_NAME}/disconnect`, () => {
  WalletAPI.disconnect();
  ToastManager.error('Wallet disconnected');
});

export const getSolBalance = createAsyncThunk<SerializableTokenAccount, PublicKey>(
  `${WALLET_SLICE_NAME}/getSolBalance`,
  async (publicKey) => {
    const balance = await getBalance(publicKey);

    const mint = new Token(
      SYSTEM_PROGRAM_ID, // Fake
      9,
      0, // Fake
      undefined,
      'Solana',
      'SOL',
    );

    const tokenAccount = new TokenAccount(mint, publicKey, balance);

    // TODO: listen to changes

    return tokenAccount.serialize();
  },
);

export const getOwnedTokenAccounts = createAsyncThunk<Array<SerializableTokenAccount>>(
  `${WALLET_SLICE_NAME}/getOwnedTokenAccounts`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    TokenAPI.listenToTokenAccountChanges(accountsForWallet, (tokenAccount) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      thunkAPI.dispatch(updateAccount(tokenAccount.serialize()));
    });

    return accountsForWallet.map((tokenAccount) => tokenAccount.serialize());
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
    void thunkAPI.dispatch(getSolBalance(wallet.pubkey));
    void thunkAPI.dispatch(getOwnedTokenAccounts());
    void thunkAPI.dispatch(getPools());
    void thunkAPI.dispatch(getMarketsRates());
    void thunkAPI.dispatch(getCandleRates('SOL'));

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

    // TODO: update balances
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
  `${WALLET_SLICE_NAME}/createMint`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    return TokenAPI.createAccountForToken(parameters.token);
  },
);

export const airdrop = createAsyncThunk<void>(
  `${WALLET_SLICE_NAME}/airdrop`,
  async (): Promise<void> => {
    await WalletAPI.airdrop();
    // TODO: update balance
  },
);

const updateAccountReducer = (
  state: Draft<WalletsState>,
  action: PayloadAction<SerializableTokenAccount>,
) => {
  // find and replace the pool in the list with the pool in the action
  const updatedAccounts = updateEntityArray(
    TokenAccount.from(action.payload),
    state.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  return {
    ...state,
    tokenAccounts: updatedAccounts.map((account) => account.serialize()),
  };
};

// The initial wallet state. No wallet is connected yet.
const makeInitialState = (): WalletsState => ({
  cluster: (localStorage.getItem(CLUSTER_STORAGE_KEY) as Cluster) || DEFAULT_CLUSTER,
  connected: false,
  publicKey: null,
  type: WalletType.SOLLET,
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
    selectCluster: (state, action: PayloadAction<Cluster>) => {
      localStorage.setItem(CLUSTER_STORAGE_KEY, action.payload);

      return {
        ...state,
        cluster: action.payload,
      };
    },
    selectType: (state, action: PayloadAction<WalletType>) => ({
      ...state,
      type: action.payload,
    }),
  },
  extraReducers: (builder) => {
    // Triggered when the connect async action is completed
    builder.addCase(connect.fulfilled, (state, action) => ({
      ...makeInitialState(),
      publicKey: action.payload,
      connected: true,
    }));
    // Triggered when the disconnect async action is completed
    builder.addCase(disconnect.fulfilled, (state) => ({
      ...makeInitialState(),
      publicKey: null,
      connected: false,
    }));
    builder.addCase(getOwnedTokenAccounts.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: state.tokenAccounts.concat(action.payload),
    }));
    builder.addCase(getSolBalance.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: state.tokenAccounts.concat(action.payload),
    }));
  },
});

export const { selectCluster, selectType, updateAccount } = walletSlice.actions;
// eslint-disable-next-line import/no-default-export
export default walletSlice.reducer;
