import { action, makeObservable, observable, when } from 'mobx';

import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';
import type { Features } from 'new/services/FeatureFlags/features';
import { RemoteConfig } from 'new/services/RemoteConfigService';

class _FeatureFlags {
  isInitialized = false;
  featureFlags = defaultFlags;

  constructor() {
    makeObservable(this, {
      isInitialized: observable,
      featureFlags: observable,
    });

    void when(
      () => RemoteConfig.isInitialized,
      action(() => {
        this.featureFlags = { ...defaultFlags, ...RemoteConfig.featureFlags };
        this.isInitialized = true;
      }),
    );
  }

  isEnabled(feature: Features): boolean {
    return this.featureFlags[feature];
  }
}

export const isEnabled = (feature: Features): boolean => {
  return FeatureFlags.isEnabled(feature);
};

export const FeatureFlags = new _FeatureFlags();
