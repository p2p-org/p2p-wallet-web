import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { FlagsProvider } from 'flagged';
import { map } from 'ramda';

import { featureFlags as defaultFeatureFlags } from 'config/featureFlags';
import { STORAGE_KEY_FEATURES_FLAGS } from 'store/slices/GlobalSlice';

export const FeatureProvider: FC = ({ children }) => {
  const featureFlagsEnabled = useSelector((state) => state.global.featureFlagsEnabled);

  const featureFlags = useMemo(() => {
    let flags: { [key: string]: boolean };
    if (featureFlagsEnabled) {
      flags = map(() => true, defaultFeatureFlags);
    } else {
      flags = defaultFeatureFlags;
      localStorage.removeItem(STORAGE_KEY_FEATURES_FLAGS);
    }

    return flags;
  }, [featureFlagsEnabled]);

  return <FlagsProvider features={featureFlags}>{children}</FlagsProvider>;
};
