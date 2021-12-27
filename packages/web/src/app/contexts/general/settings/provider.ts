import { createContainer } from 'unstated-next';

import type { UseMainSettings, UseTokenAccountsSettings } from './internal';
import { useMainSettingsInternal, useTokenAccountsSettingsInternal } from './internal';

export interface UseSettings extends UseMainSettings, UseTokenAccountsSettings {}

const useSettingsInternal = (): UseSettings => {
  const mainSettings = useMainSettingsInternal();
  const tokenAccounts = useTokenAccountsSettingsInternal({
    isZeroBalancesHidden: mainSettings.settings.isZeroBalancesHidden,
  });

  return {
    ...mainSettings,
    ...tokenAccounts,
  };
};

export const { Provider: SettingsProvider, useContainer: useSettings } =
  createContainer(useSettingsInternal);
