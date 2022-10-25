import type { FeatureFlagsType } from './defaultFlags';
import type { Features } from './features';

export interface FeatureFlagsProvider {
  isOn: boolean;
  isInitialized: boolean;
  featureFlags: FeatureFlagsType;
  isEnabled: (feature: Features) => boolean;
}
