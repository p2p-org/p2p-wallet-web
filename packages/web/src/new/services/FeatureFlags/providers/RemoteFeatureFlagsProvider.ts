import { action, makeObservable, observable, when } from 'mobx';

import { RemoteConfig } from 'new/services/RemoteConfig';

import { defaultFlags } from '../defaultFlags';
import type { Features } from '../features';
import type { FeatureFlagsProvider } from '../types';

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
