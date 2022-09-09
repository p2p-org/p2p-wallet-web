import { initializeApp } from 'firebase/app';
import type { RemoteConfig as RemoteConfigType, Value } from 'firebase/remote-config';
import { activate, fetchConfig, getAll, getRemoteConfig } from 'firebase/remote-config';
import { action, makeObservable, observable } from 'mobx';

import type { FeatureFlagsType } from 'new/services/FeatureFlags/defaultFlags';
import { Features } from 'new/services/FeatureFlags/features';
import { ConfigKeys, defaultConfig } from 'new/services/RemoteConfig/defaultConfig';
import { firebaseConfig } from 'new/services/RemoteConfig/firebaseConfig';

type NetworkValue = { urlString: string; network: string; additionalQuery?: string };

class _RemoteConfig {
  private readonly _remoteConfig: RemoteConfigType;

  isActivated = false;

  constructor() {
    makeObservable(this, {
      isActivated: observable,
    });

    const app = initializeApp(firebaseConfig);
    this._remoteConfig = getRemoteConfig(app);

    this._remoteConfig.defaultConfig = defaultConfig;

    // @ts-ignore
    if (__DEVELOPMENT__ || process.env.REACT_APP_STAGING) {
      this._remoteConfig.settings.minimumFetchIntervalMillis = 10000; // default value is 12 hours
      // setLogLevel(this._remoteConfig, 'debug');
    }

    void activate(this._remoteConfig)
      .then(action(() => (this.isActivated = true)))
      .then(() => void fetchConfig(this._remoteConfig));
  }

  private _getConfig(): Record<string, Value> {
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

export const RemoteConfig = new _RemoteConfig();
