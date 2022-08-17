import { initializeApp } from 'firebase/app';
import type { RemoteConfig } from 'firebase/remote-config';
import { fetchAndActivate, getAll, getRemoteConfig, setLogLevel } from 'firebase/remote-config';
import { makeObservable, observable, runInAction } from 'mobx';

import type { FeatureFlagsType } from 'new/services/FetureFlags/defaultFlags';
import { defaultFlags } from 'new/services/FetureFlags/defaultFlags';
import { Features } from 'new/services/FetureFlags/features';
import { firebaseConfig } from 'new/services/FetureFlags/firebaseConfig';

class FeatureFlags {
  private readonly _remoteConfig: RemoteConfig;

  isInitialized = false;
  featureFlags = defaultFlags;

  constructor() {
    makeObservable(this, {
      isInitialized: observable,
      featureFlags: observable,
    });

    const app = initializeApp(firebaseConfig);
    this._remoteConfig = getRemoteConfig(app);

    this._remoteConfig.defaultConfig = defaultFlags;

    // TODO: REMOVE: only for period of developing of task https://p2pvalidator.atlassian.net/browse/PWN-4423
    // @ts-ignore
    if (__DEVELOPMENT__ || process.env.REACT_APP_STAGING) {
      this._remoteConfig.settings.minimumFetchIntervalMillis = 0; // default value is 12 hours
      setLogLevel(this._remoteConfig, 'debug');
    }

    void fetchAndActivate(this._remoteConfig).then(() => {
      const values = getAll(this._remoteConfig);

      runInAction(() => {
        this.featureFlags = Object.values(Features).reduce<FeatureFlagsType>(
          (acc, key) => {
            acc[key as Features] = values[key]?.asBoolean() || false;
            return acc;
          },
          { ...defaultFlags },
        );

        this.isInitialized = true;
      });
    });
  }

  isEnabled(feature: Features): boolean {
    return this.featureFlags[feature];
  }
}

export const featureFlags = new FeatureFlags();
