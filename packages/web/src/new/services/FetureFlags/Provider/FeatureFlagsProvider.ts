import { initializeApp } from 'firebase/app';
import type { RemoteConfig, Value } from 'firebase/remote-config';
import { fetchAndActivate, getAll, getRemoteConfig, setLogLevel } from 'firebase/remote-config';
import { singleton } from 'tsyringe';

import { defaultConfig } from 'new/services/FetureFlags/Provider/defaultConfig';
import { firebaseConfig } from 'new/services/FetureFlags/Provider/firebaseConfig';

type ValuesType = {
  web_testFeatureEnabled: Value;
};

interface FeatureFlagsProviderType {
  whenActivated: (callback: () => void) => void;
  getValues: () => ValuesType;
}

@singleton()
export class FeatureFlagsProvider implements FeatureFlagsProviderType {
  private readonly _remoteConfig: RemoteConfig;
  private readonly _activatedPromise: Promise<void>;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this._remoteConfig = getRemoteConfig(app);

    this._remoteConfig.defaultConfig = defaultConfig;

    // TODO: REMOVE: only for period of developing of task https://p2pvalidator.atlassian.net/browse/PWN-4423
    if (__DEVELOPMENT__ || process.env.REACT_APP_STAGING) {
      this._remoteConfig.settings.minimumFetchIntervalMillis = 0; // default value is 12 hours
      setLogLevel(this._remoteConfig, 'debug');
    }

    // thanks to last "then" _activatedPromise is fulfilled with no values
    this._activatedPromise = fetchAndActivate(this._remoteConfig).then();
  }

  whenActivated(callback: () => void): void {
    void this._activatedPromise.then(() => callback());
  }

  getValues(): ValuesType {
    return getAll(this._remoteConfig) as ValuesType;
  }
}
