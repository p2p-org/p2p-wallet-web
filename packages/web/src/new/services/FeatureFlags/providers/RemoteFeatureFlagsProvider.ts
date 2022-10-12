import { action, makeObservable, observable, when } from 'mobx';

import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';
import type { Features } from 'new/services/FeatureFlags/features';
import type { FeatureFlagsProvider } from 'new/services/FeatureFlags/types';
import { RemoteConfig } from 'new/services/RemoteConfig';

class _RemoteFeatureFlagsProvider implements FeatureFlagsProvider {
  readonly isOn = true;
  isInitialized = false;
  featureFlags = defaultFlags;

  constructor() {
    makeObservable(this, {
      isInitialized: observable,
      featureFlags: observable,
    });

    when(
      () => RemoteConfig.isActivated,
      action(() => {
        this.featureFlags = RemoteConfig.featureFlags;
        this.isInitialized = true;
      }),
    );
  }

  isEnabled(feature: Features): boolean {
    return this.featureFlags[feature];
  }
}

export const RemoteFeatureFlagsProvider = new _RemoteFeatureFlagsProvider();
