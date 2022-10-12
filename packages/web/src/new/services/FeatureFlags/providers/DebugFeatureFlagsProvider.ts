import { action, makeObservable, observable } from 'mobx';

import { makeLocalStorage } from 'new/services/common/makeLocalStorage';

import { defaultFlags } from '../defaultFlags';
import type { Features } from '../features';
import type { FeatureFlagsProvider } from '../types';

const DEBUG_FEATURE_FLAGS_KEY = 'feature_flags_debug';

interface Storage {
  isManualFlagsOn: boolean;
  featureFlags: Record<Features, boolean>;
}

class _DebugFeatureFlagsProvider implements FeatureFlagsProvider {
  isOn = false;
  readonly isInitialized: boolean;
  featureFlags = defaultFlags;

  constructor() {
    makeObservable(this, {
      isOn: observable,
      featureFlags: observable,

      setIsOn: action,
      setFeatureFlag: action,
    });

    makeLocalStorage<Storage>(this, DEBUG_FEATURE_FLAGS_KEY);

    this.isInitialized = true;
  }

  isEnabled(feature: Features): boolean {
    return this.featureFlags[feature];
  }

  setIsOn(value: boolean): void {
    this.isOn = value;
  }

  setFeatureFlag(feature: Features, value: boolean): void {
    this.featureFlags[feature] = value;
  }

  fromJSON(json: Storage): Storage {
    return {
      ...json,
    };
  }
}

export const DebugFeatureFlagsProvider = new _DebugFeatureFlagsProvider();
