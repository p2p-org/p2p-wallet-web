import { DEFAULT_NETWORK } from 'config/constants';
import type { WalletSettings } from 'utils/types';

const WALLET_SETTINGS_KEY = 'walletSettings';
const WALLET_HIDDEN_TOKENS_KEY = 'walletHiddenTokens';
const WALLET_DISPLAYED_ZERO_BALANCE_TOKENS = 'walletDisplayedZeroBalanceTokens';
const USERNAME_BANNER_KEY = 'isUsernameBannerDisplayed';

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

export const appearance = ['system', 'light', 'dark'];

export const defaultSettings: WalletSettings = {
  currency: 'USD',
  appearance: 'system',
  network: DEFAULT_NETWORK,
  isZeroBalancesHidden: true,
  useFreeTransactions: true,
};

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

function loadSetFromLocalStorage(itemKey: string): Set<string> {
  const itemString = localStorage.getItem(itemKey) as string;
  let items: string[] = [];

  if (!itemString) {
    return new Set();
  }

  try {
    items = JSON.parse(itemString) as string[];
  } catch (error) {
    console.error(error);
  }

  return new Set([...items]);
}

function addOrDeleteItem(set: Set<string>, item: string, itemKey: string) {
  if (set.has(item)) {
    set.delete(item);
  } else {
    set.add(item);
  }

  localStorage.setItem(itemKey, JSON.stringify(Array.from(set)));
}

function removeItem(set: Set<string>, item: string, itemKey: string) {
  if (set.has(item)) {
    set.delete(item);
    localStorage.setItem(itemKey, JSON.stringify(Array.from(set)));
  }
}

export function loadHiddenTokens(): Set<string> {
  return loadSetFromLocalStorage(WALLET_HIDDEN_TOKENS_KEY);
}

export function hideUnhideToken(pubkey: string) {
  const tokens = loadHiddenTokens();

  addOrDeleteItem(tokens, pubkey, WALLET_HIDDEN_TOKENS_KEY);
}

export function removeHiddenToken(pubkey: string) {
  const tokens = loadHiddenTokens();

  removeItem(tokens, pubkey, WALLET_HIDDEN_TOKENS_KEY);
}

export function loadZeroBalanceTokens(): Set<string> {
  return loadSetFromLocalStorage(WALLET_DISPLAYED_ZERO_BALANCE_TOKENS);
}

export function hideUnhideZeroBalanceToken(pubkey: string) {
  const tokens = loadZeroBalanceTokens();

  addOrDeleteItem(tokens, pubkey, WALLET_DISPLAYED_ZERO_BALANCE_TOKENS);
}

export function removeZeroBalanceToken(pubkey: string) {
  const tokens = loadZeroBalanceTokens();

  removeItem(tokens, pubkey, WALLET_DISPLAYED_ZERO_BALANCE_TOKENS);
}

export function removeClosedTokenKeys(pubkey: string) {
  removeHiddenToken(pubkey);
  removeZeroBalanceToken(pubkey);
}

export function isUsernameBannerDisplayed() {
  const item = localStorage.getItem(USERNAME_BANNER_KEY) as string;
  if (!item) return true;
  return JSON.parse(item);
}

export function hideUsernameBanner() {
  localStorage.setItem(USERNAME_BANNER_KEY, 'false');
}
