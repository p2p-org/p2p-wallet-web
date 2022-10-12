import { computed, makeObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { FeatureFlagsType } from 'new/services/FeatureFlags/defaultFlags';
import type { Features } from 'new/services/FeatureFlags/features';
import { DebugFeatureFlagsProvider } from 'new/services/FeatureFlags/providers/DebugFeatureFlagsProvider';

@singleton()
export class DebugFeatureFlagsManagerViewModel extends ViewModel {
  constructor() {
    super();

    makeObservable(this, {
      isOn: computed,
      featureFlags: computed,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get isOn(): boolean {
    return DebugFeatureFlagsProvider.isOn;
  }

  get featureFlags(): FeatureFlagsType {
    return DebugFeatureFlagsProvider.featureFlags;
  }

  setDebugFeatureFlagsOn(value: boolean): void {
    DebugFeatureFlagsProvider.setIsOn(value);
  }

  setDebugFeatureFlag(feature: Features, value: boolean): void {
    DebugFeatureFlagsProvider.setFeatureFlag(feature, value);
  }
}
