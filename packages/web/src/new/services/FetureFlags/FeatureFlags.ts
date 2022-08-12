import { makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { FeatureFlagsProvider } from 'new/services/FetureFlags/Provider/FeatureFlagsProvider';

interface FeatureFlagsType {
  testFeatureEnabled: boolean;
}

@singleton()
export class FeatureFlags implements FeatureFlagsType {
  testFeatureEnabled = false;

  constructor(private _provider: FeatureFlagsProvider) {
    makeObservable(this, {
      testFeatureEnabled: observable,
    });

    this._updateFlags = this._updateFlags.bind(this);

    this._provider.whenActivated(this._updateFlags);
  }

  private _updateFlags() {
    const values = this._provider.getValues();

    runInAction(() => {
      this.testFeatureEnabled = values.web_testFeatureEnabled.asBoolean();
    });
  }
}
