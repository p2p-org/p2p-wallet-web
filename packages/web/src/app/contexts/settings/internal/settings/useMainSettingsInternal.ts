import { useCallback } from 'react';

import type { ValueOf } from '@p2p-wallet-web/core';
import { useStorage } from '@p2p-wallet-web/core';
import { mergeDeepRight } from 'ramda';

import type { APPEARANCE } from '../../constants/common';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export type MainSettings = {
  // Main
  currency: string;
  appearance: ValueOf<typeof APPEARANCE>;
  isZeroBalancesHidden: boolean;
  useFreeTransactions: boolean;

  // Other
  usernameBannerHiddenByUser: boolean;
};

const DEFAULT_MAIN_SETTINGS: MainSettings = {
  // Main
  currency: 'USD',
  appearance: 'system',
  isZeroBalancesHidden: true,
  useFreeTransactions: true,

  usernameBannerHiddenByUser: false,
};

export interface UseMainSettings {
  settings: MainSettings;
  updateSettings: (nextSettings: Partial<MainSettings>) => void;
}

export const useMainSettingsInternal = (): UseMainSettings => {
  const [settings, isSettingsLoading, setSettings] = useStorage<MainSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_MAIN_SETTINGS,
  );

  const updateSettings = useCallback(
    (nextSettings: Partial<MainSettings>) => {
      const newSettings = mergeDeepRight(settings, nextSettings);

      setSettings(newSettings);
    },
    [setSettings, settings],
  );

  return {
    settings,
    updateSettings,
  };
};
