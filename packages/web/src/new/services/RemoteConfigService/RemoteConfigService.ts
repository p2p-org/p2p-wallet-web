import { initializeApp } from 'firebase/app';
import type { RemoteConfig, Value } from 'firebase/remote-config';
import { fetchAndActivate, getAll, getRemoteConfig, setLogLevel } from 'firebase/remote-config';
import { makeObservable, observable, runInAction } from 'mobx';
import assert from 'ts-invariant';

import type { FeatureFlagsType } from 'new/services/FeatureFlags/defaultFlags';
import { Features } from 'new/services/FeatureFlags/features';
import { ConfigKeys, defaultConfig } from 'new/services/RemoteConfigService/defaultConfig';
import { firebaseConfig } from 'new/services/RemoteConfigService/firebaseConfig';

type NetworkValue = { urlString: string; network: string; additionalQuery?: string };

class _RemoteConfigService {
  private readonly _remoteConfig: RemoteConfig;

  isInitialized = false;

  constructor() {
    makeObservable(this, {
      isInitialized: observable,
    });

    const app = initializeApp(firebaseConfig);
    this._remoteConfig = getRemoteConfig(app);

    this._remoteConfig.defaultConfig = defaultConfig;

    // @ts-ignore
    if (__DEVELOPMENT__ || process.env.REACT_APP_STAGING) {
      this._remoteConfig.settings.minimumFetchIntervalMillis = 10000; // default value is 12 hours
      setLogLevel(this._remoteConfig, 'debug');
    }

    void fetchAndActivate(this._remoteConfig).then(() => {
      runInAction(() => {
        this.isInitialized = true;
      });
    });
  }

  private _getConfig(): Record<string, Value> {
    assert(this.isInitialized, 'Remote Config is not initialized');
    return getAll(this._remoteConfig);
  }

  get definedEndpoints(): NetworkValue[] {
    return JSON.parse(
      this._getConfig()[ConfigKeys.NetworkSettings]?.asString() || '[]',
    ) as NetworkValue[];
  }

  get featureFlags(): Record<Features, boolean> {
    const values = this._getConfig();

    return Object.values(Features).reduce<FeatureFlagsType>((acc, key) => {
      acc[key as Features] = values[key]?.asBoolean() || false;
      return acc;
    }, {} as FeatureFlagsType);
  }
}

export const RemoteConfigService = new _RemoteConfigService();
