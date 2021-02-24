import { WalletSettings } from 'utils/types';

const WALLET_SETTINGS_KEY = 'walletSettings';

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

export const defaultSettings = {
  currency: 'USD',
  appearance: 'system',
  network: 'mainnet-beta',
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
