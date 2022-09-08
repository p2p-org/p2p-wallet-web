import { action, makeObservable, observable, when } from 'mobx';

import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';
import type { Features } from 'new/services/FeatureFlags/features';
import { RemoteConfigService } from 'new/services/RemoteConfigService';

class _FeatureFlags {
  isInitialized = false;
  featureFlags = defaultFlags;

  constructor() {
    makeObservable(this, {
      isInitialized: observable,
      featureFlags: observable,
    });

    void when(
      () => RemoteConfigService.isInitialized,
      action(() => {
        this.featureFlags = { ...defaultFlags, ...RemoteConfigService.featureFlags };
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
