import type { FC } from 'react';
import { createContext, useContext, useMemo } from 'react';

import type { SetStorageValue } from '@p2p-wallet-web/core';
import { useStorage } from '@p2p-wallet-web/core';
import { FlagsProvider } from 'flagged';
import { map } from 'ramda';

import { featureFlags as defaultFeatureFlags } from 'config/featureFlags';

const STORAGE_KEY_FEATURES_FLAGS = 'all_features';

const FeatureFlagsContext = createContext<{
  featureFlagsEnabled: boolean;
  setFeatureFlagsEnabled: SetStorageValue<boolean>;
}>({
  featureFlagsEnabled: false,
  setFeatureFlagsEnabled: () => undefined,
});

export const FeatureFlagsProvider: FC = ({ children }) => {
  const [featureFlagsEnabled, setFeatureFlagsEnabled] = useStorage(
    STORAGE_KEY_FEATURES_FLAGS,
    false,
  );

  const featureFlags = useMemo(() => {
    let flags: { [key: string]: boolean };
    if (featureFlagsEnabled) {
      flags = map(() => true, defaultFeatureFlags);
    } else {
      flags = defaultFeatureFlags;
    }

    return flags;
  }, [featureFlagsEnabled]);

  return (
    <FeatureFlagsContext.Provider
      value={{
        featureFlagsEnabled,
        setFeatureFlagsEnabled,
      }}
    >
      <FlagsProvider features={featureFlags}>{children}</FlagsProvider>
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagsContext);

  if (ctx === null) {
    throw new Error('Context not available');
  }

  return ctx;
};
