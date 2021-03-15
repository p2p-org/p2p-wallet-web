import { WalletSettings } from 'utils/types';

const WALLET_SETTINGS_KEY = 'walletSettings';
const WALLET_HIDDEN_TOKENS_KEY = 'walletHiddenTokens';

export const currencies = [
  {
    ticker: 'USD',
    name: 'United States Dollar',
    symbol: '$',
  },
  {
    ticker: 'EUR',
    name: 'Euro',
    symbol: '€',
  },
  {
    ticker: 'RUB',
    name: 'Russian Ruble',
    symbol: 'Rub',
  },
];

type ClusterEntrypoint = {
  [cluster: string]: string;
};

export const clusters = {
  'mainnet-beta': 'https://solana-api.projectserum.com/',
  devnet: 'https://devnet.solana.com',
  testnet: 'https://testnet.solana.com',
} as ClusterEntrypoint;

export const appearance = ['system', 'light', 'dark'];

export const defaultSettings = {
  currency: 'USD',
  appearance: 'system',
  network: {
    current: 'mainnet-beta',
  },
} as WalletSettings;

export function loadSettings(): WalletSettings {
  const localSettings = localStorage.getItem(WALLET_SETTINGS_KEY) as string;

  if (!localSettings) {
    return defaultSettings;
  }

  let settings = defaultSettings;

  try {
    settings = JSON.parse(localSettings) as WalletSettings;
  } catch (error) {
    console.error(error);
  }

  return settings;
}

export function saveSettings(settings: WalletSettings) {
  localStorage.setItem(WALLET_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHiddenTokens(): Set<string> {
  const hiddenTokens = localStorage.getItem(WALLET_HIDDEN_TOKENS_KEY) as string;
  let tokens: string[] = [];

  if (!hiddenTokens) {
    return new Set();
  }

  try {
    tokens = JSON.parse(hiddenTokens) as string[];
  } catch (error) {
    console.error(error);
  }

  return new Set([...tokens]);
}

export function hideUnhideToken(pubkey: string) {
  const tokens = loadHiddenTokens();

  if (tokens.has(pubkey)) {
    tokens.delete(pubkey);
  } else {
    tokens.add(pubkey);
  }

  // eslint-disable-next-line unicorn/prefer-spread
  localStorage.setItem(WALLET_HIDDEN_TOKENS_KEY, JSON.stringify(Array.from(tokens)));
}

export function removeHiddenToken(pubkey: string) {
  const tokens = loadHiddenTokens();

  if (tokens.has(pubkey)) {
    tokens.delete(pubkey);
    // eslint-disable-next-line unicorn/prefer-spread
    localStorage.setItem(WALLET_HIDDEN_TOKENS_KEY, JSON.stringify(Array.from(tokens)));
  }
}
