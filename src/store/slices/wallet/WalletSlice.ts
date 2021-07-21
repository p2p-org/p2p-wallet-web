import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
  unwrapResult,
} from '@reduxjs/toolkit';
import { Account, Blockhash, FeeCalculator, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { mergeDeepRight } from 'ramda';

import { APIFactory as FeeRelayerAPIFactory } from 'api/feeRelayer';
import { API, APIFactory as TokenAPIFactory, TransferParameters } from 'api/token';
import { AccountListener } from 'api/token/AccountListener';
import colors from 'api/token/colors.config';
import { Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { Transaction } from 'api/transaction/Transaction';
import * as WalletAPI from 'api/wallet';
import {
  awaitConfirmation,
  getBalance,
  getWallet,
  getWalletUnsafe,
  WalletDataType,
  WalletType,
} from 'api/wallet';
import {
  getDerivableAccounts,
  loadMnemonicAndSeed,
  ManualWalletData,
} from 'api/wallet/ManualWallet';
import { WalletEvent } from 'api/wallet/Wallet';
import { ToastManager } from 'components/common/ToastManager';
import { DEFAULT_NETWORK, NetworkType, swapHostFeeAddress } from 'config/constants';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { RootState } from 'store/rootReducer';
import { getAvailableTokens, wipeAction } from 'store/slices/GlobalSlice';
import { getPools } from 'store/slices/pool/PoolSlice';
import { getRatesCandle, getRatesMarkets } from 'store/slices/rate/RateSlice';
import { updateEntityArray } from 'store/slices/tokenPair/utils/tokenPair';
import {
  addPendingTransaction,
  updateTransactions,
} from 'store/slices/transaction/TransactionSlice';
import { minorAmountToMajor } from 'utils/amount';
import {
  loadHiddenTokens,
  loadSettings,
  loadZeroBalanceTokens,
  removeZeroBalanceToken,
  saveSettings,
} from 'utils/settings';
import { transferNotification } from 'utils/transactionNotifications';
import { WalletSettings } from 'utils/types';

const STORAGE_KEY_TYPE = 'type';

export const WALLET_SLICE_NAME = 'wallet';

const accountsListeners: AccountListener[] = [];

export interface WalletsState {
  network: NetworkType;
  connected: boolean;
  publicKey: string | null;
  type: WalletType;
  tokenAccounts: Array<SerializableTokenAccount>;
  derivableTokenAccounts: Array<SerializableTokenAccount>;
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
const getSolToken = async (TokenAPI: API, publicKey: PublicKey, isDerivable?: boolean) => {
  const balance = await getBalance(publicKey);
  const tokenInfo = TokenAPI.getConfigForToken(WRAPPED_SOL_MINT);

  // Fake token to simulate SOL as Token
  const mint = new Token(
    SYSTEM_PROGRAM_ID,
    9,
    0,
    undefined,
    'Solana',
    'SOL',
    colors.SOL,
    tokenInfo?.logoURI,
  );
  return new TokenAccount(
    mint,
    SYSTEM_PROGRAM_ID,
    SYSTEM_PROGRAM_ID,
    publicKey,
    balance,
    isDerivable,
  );
};

export const getDerivableTokenAccounts = createAsyncThunk<
  SerializableTokenAccount[],
  { seed: string; derivationPath: string }
>(`${WALLET_SLICE_NAME}/getDerivableTokenAccounts`, async (data, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;
  const walletState = state.wallet;
  const TokenAPI = TokenAPIFactory(walletState.network);
  // if didn't connected(need for DerivableAccount component/page)
  const walletPublicKey = getWalletUnsafe()?.pubkey || null;

  const accounts = getDerivableAccounts(data.seed, data.derivationPath);
  const publicKeys = accounts.map((account) => account.publicKey);

  const promises = publicKeys.map((publicKey) => {
    const isDerivable = walletPublicKey ? !walletPublicKey?.equals(publicKey) : false;
    return getSolToken(TokenAPI, publicKey, isDerivable);
  });
  const derivableTokenAccounts = await Promise.all(promises);

  return derivableTokenAccounts.map((tokenAccount) => tokenAccount.serialize()) || [];
});

export const getTokenAccount = createAsyncThunk<TokenAccount | null, PublicKey>(
  `${WALLET_SLICE_NAME}/getTokenAccount`,
  async (account, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    return TokenAPI.tokenAccountInfo(account);
  },
);

const updateHitory = createAsyncThunk<void, TokenAccount>(
  `${WALLET_SLICE_NAME}/updateHitory`,
  (account, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;

    if (state.transaction.currentHistoryPubkey === account.address.toBase58()) {
      thunkAPI.dispatch(updateTransactions(true));
    }
  },
);

export const getTokenAccountsForWallet = createAsyncThunk<SerializableTokenAccount[]>(
  `${WALLET_SLICE_NAME}/getTokenAccountsForWallet`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const { network, type, derivableTokenAccounts } = state.wallet;
    const TokenAPI = TokenAPIFactory(network);

    const solTokens = [];

    // If manual
    if (type === WalletType.MANUAL) {
      // TODO: temp for future feature
      solTokens.push(TokenAccount.from(derivableTokenAccounts[0]));
      // derivableTokenAccounts.forEach((account) => solTokens.push(TokenAccount.from(account)));
    } else {
      // Simulated SOL token for sollet and other wallet types
      const publicKey = getWallet().pubkey;
      solTokens.push(await getSolToken(TokenAPI, publicKey));
    }

    // Get all Tokens
    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    // Merge SOL and Tokens as token accounts
    const tokenAccounts = [...solTokens, ...accountsForWallet];

    const listener = TokenAPI.listenToTokenAccountChanges(tokenAccounts, (updatedTokenAccount) => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      thunkAPI.dispatch(updateAccount(updatedTokenAccount.serialize()));
      void thunkAPI.dispatch(updateHitory(updatedTokenAccount));
    });

    accountsListeners.push(listener);

    return tokenAccounts.map((tokenAccount) => tokenAccount.serialize());
  },
);

export const updateTokenAccountsForWallet = createAsyncThunk<SerializableTokenAccount[]>(
  `${WALLET_SLICE_NAME}/updateTokenAccountsForWallet`,
  async (_, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const { network, tokenAccounts } = state.wallet;
    const TokenAPI = TokenAPIFactory(network);

    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    const tokenAccountsAddresses = new Set(tokenAccounts.map((token) => token.address));

    const newTokenAccounts = [];

    for (const account of accountsForWallet) {
      if (!tokenAccountsAddresses.has(account.address.toBase58())) {
        newTokenAccounts.push(account);

        const listener = TokenAPI.listenToTokenAccountChanges(
          newTokenAccounts,
          (updatedTokenAccount) => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            thunkAPI.dispatch(updateAccount(updatedTokenAccount.serialize()));
          },
        );

        accountsListeners.push(listener);

        ToastManager.info('Wallet successfully created!');

        const { symbol } = account.mint;

        transferNotification({
          header: 'Received',
          text: `+ ${minorAmountToMajor(account.balance, account.mint).toString()} ${symbol}`,
          symbol,
        });
      }
    }

    return newTokenAccounts.map((tokenAccount) => tokenAccount.serialize());
  },
);

export const precacheTokenAccounts = createAsyncThunk<void, PublicKey>(
  `${WALLET_SLICE_NAME}/precacheTokenAccounts`,
  async (publicKey, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    await TokenAPI.precacheTokenAccounts(publicKey);
  },
);

export const autoConnect = createAsyncThunk<string | undefined>(
  `${WALLET_SLICE_NAME}/autoConnect`,
  async (_, thunkAPI) => {
    const {
      wallet: { type },
    }: RootState = thunkAPI.getState() as RootState;

    let processedData;

    if (type === WalletType.MANUAL) {
      processedData = (await loadMnemonicAndSeed()) as ManualWalletData;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return unwrapResult(await thunkAPI.dispatch(connectWallet(processedData)));
  },
);

export const connect = createAsyncThunk(`${WALLET_SLICE_NAME}/connect`, (_, thunkAPI) => {
  const {
    wallet: { network },
  }: RootState = thunkAPI.getState() as RootState;

  WalletAPI.connect(network);
});

/**
 * Async action to connect to a wallet. Creates a new wallet instance,
 * connects to it, and connects action dispatchers, when a disconnect event
 * (e.g. the user closes the wallet tab) occurs.
 *
 * The output of the action is the user's public key in Base58 form,
 * so that the user can verify it.
 */
export const connectWallet = createAsyncThunk<string, WalletDataType | undefined>(
  `${WALLET_SLICE_NAME}/connectWallet`,
  async (data, thunkAPI) => {
    const {
      wallet: { network, type },
    }: RootState = thunkAPI.getState() as RootState;

    const wallet = await WalletAPI.connectWallet(network, type, data);

    wallet.on(WalletEvent.DISCONNECT, () => {
      void thunkAPI.dispatch(disconnect());
      ToastManager.error('Wallet disconnected');
    });

    // wallet.on(WalletEvent.CONFIRMED, ({ transactionSignature }) =>
    //   ToastManager.info(`Confirmed: ${transactionSignature}`),
    // );

    ToastManager.info('Wallet connected');

    // Make and store derivable before getAvailableTokens
    if (type === WalletType.MANUAL && data?.seed && data?.derivationPath) {
      await thunkAPI.dispatch(
        getDerivableTokenAccounts({ seed: data.seed, derivationPath: data.derivationPath }),
      );
    }

    // Get tokens first before getting accounts and pools,
    // to avail of the token caching feature
    await thunkAPI.dispatch(getAvailableTokens());
    void thunkAPI.dispatch(getTokenAccountsForWallet());
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

export const createMint = createAsyncThunk<
  string,
  { amount: number; decimals: number; initialAccount: Account }
>(`${WALLET_SLICE_NAME}/createMint`, async (parameters, thunkAPI) => {
  const state: RootState = thunkAPI.getState() as RootState;
  const walletState = state.wallet;
  const TokenAPI = TokenAPIFactory(walletState.network);

  return TokenAPI.createMint(parameters.amount, parameters.decimals, parameters.initialAccount);
});

export const createAccountForToken = createAsyncThunk<TokenAccount, { token: Token }>(
  `${WALLET_SLICE_NAME}/createAccountForToken`,
  async (parameters, thunkAPI) => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.network);

    return TokenAPI.createAccountForToken(parameters.token);
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
    // eslint-disable-next-line unicorn/prefer-spread
    zeroBalanceTokens: Array.from(loadZeroBalanceTokens()),
  };
};

// The initial wallet state. No wallet is connected yet.
const makeInitialState = (): WalletsState => ({
  network: loadSettings().network || DEFAULT_NETWORK,
  connected: false,
  publicKey: null,
  type: localStorage.getItem(STORAGE_KEY_TYPE)
    ? Number(localStorage.getItem(STORAGE_KEY_TYPE))
    : WalletType.MANUAL,
  tokenAccounts: [],
  derivableTokenAccounts: [],
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
    selectNetwork: (state, action: PayloadAction<NetworkType>) => ({
      ...state,
      network: action.payload,
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
    builder.addCase(connectWallet.fulfilled, (state, action) => ({
      ...makeInitialState(),
      publicKey: action.payload,
      connected: true,
      derivableTokenAccounts: state.derivableTokenAccounts,
    }));
    // Triggered when the disconnect async action is completed
    builder.addCase(disconnect.fulfilled, () => ({
      ...makeInitialState(),
      publicKey: null,
      connected: false,
    }));
    builder.addCase(getDerivableTokenAccounts.fulfilled, (state, action) => ({
      ...state,
      derivableTokenAccounts: action.payload,
    }));
    builder.addCase(getTokenAccountsForWallet.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: state.tokenAccounts.concat(action.payload),
    }));
    builder.addCase(updateTokenAccountsForWallet.fulfilled, (state, action) => ({
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
  selectNetwork,
  selectType,
  updateAccount,
  updateHiddenTokens,
  updateSettings,
} = walletSlice.actions;
// eslint-disable-next-line import/no-default-export
export default walletSlice.reducer;
