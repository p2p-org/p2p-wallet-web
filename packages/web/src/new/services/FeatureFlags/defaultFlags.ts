import { Features } from 'new/services/FeatureFlags/features';

export type FeatureFlagsType = { [key in Features]: boolean };

export const defaultFlags: FeatureFlagsType = {
  [Features.TestFeature]: false,
};
