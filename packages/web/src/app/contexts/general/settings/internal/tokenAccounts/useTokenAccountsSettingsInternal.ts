import { useCallback } from 'react';

import { useStorage } from '@p2p-wallet-web/core';

import { STORAGE_KEYS } from '../../constants/storageKeys';
import type { TokenAccountsSettings } from '../../types';
import { toggleTokenAccount } from '../../utils';

const DEFAULT_TOKEN_ACCOUNTS_SETTINGS: TokenAccountsSettings = {
  hiddenTokenAccounts: [],
  forceShowTokenAccounts: [],
};

export interface UseTokenAccountsSettingsArgs {
  isZeroBalancesHidden: boolean;
}

export interface UseTokenAccountsSettings {
  tokenAccounts: TokenAccountsSettings;
  toggleHideTokenAccount: (publicKey: string, isZero: boolean) => void;
}

export const useTokenAccountsSettingsInternal = ({
  isZeroBalancesHidden,
}: UseTokenAccountsSettingsArgs): UseTokenAccountsSettings => {
  const [tokenAccounts, setSettings] = useStorage<TokenAccountsSettings>(
    STORAGE_KEYS.tokenAccounts,
    DEFAULT_TOKEN_ACCOUNTS_SETTINGS,
  );

  const toggleHideTokenAccount = useCallback(
    (publicKey: string, isZero: boolean) => {
      const newSettings: TokenAccountsSettings = { ...tokenAccounts };

      if (isZeroBalancesHidden && isZero) {
        newSettings.forceShowTokenAccounts = toggleTokenAccount(
          publicKey,
          tokenAccounts.forceShowTokenAccounts,
        );
        newSettings.hiddenTokenAccounts = newSettings.hiddenTokenAccounts.filter(
          (hiddenPublicKey) => hiddenPublicKey !== publicKey,
        );
      } else {
        newSettings.forceShowTokenAccounts = newSettings.forceShowTokenAccounts.filter(
          (hiddenPublicKey) => hiddenPublicKey !== publicKey,
        );
        newSettings.hiddenTokenAccounts = toggleTokenAccount(
          publicKey,
          tokenAccounts.hiddenTokenAccounts,
        );
      }

      setSettings(newSettings);
    },
    [isZeroBalancesHidden, setSettings, tokenAccounts],
  );

  return {
    tokenAccounts,
    toggleHideTokenAccount,
  };
};
