import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';
import { RemoteFeatureFlagsProvider } from 'new/services/FeatureFlags/providers/RemoteFeatureFlagsProvider';
import type { FeatureFlagsProvider } from 'new/services/FeatureFlags/types';

import type { Features } from './features';
import { DebugFeatureFlagsProvider } from './providers/DebugFeatureFlagsProvider';

class _FeatureFlags {
  private _primaryProvider: FeatureFlagsProvider;
  private _secondaryProvider: FeatureFlagsProvider;

  constructor(primaryProvider: FeatureFlagsProvider, secondaryProvider: FeatureFlagsProvider) {
    this._primaryProvider = primaryProvider;
    this._secondaryProvider = secondaryProvider;
  }

  get isInitialized(): boolean {
    if (this._primaryProvider.isOn) {
      return this._primaryProvider.isInitialized;
    }

    if (this._secondaryProvider.isOn) {
      return this._secondaryProvider.isInitialized;
    }

    return false;
  }

  isEnabled(feature: Features): boolean {
    if (this._primaryProvider.isOn) {
      return this._primaryProvider.isEnabled(feature);
    }

    if (this._secondaryProvider.isOn) {
      return this._secondaryProvider.isEnabled(feature);
    }

    return defaultFlags[feature];
  }
}

export const isEnabled = (feature: Features): boolean => {
  return FeatureFlags.isEnabled(feature);
};

export const FeatureFlags = new _FeatureFlags(
  DebugFeatureFlagsProvider,
  RemoteFeatureFlagsProvider,
);
