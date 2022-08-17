import { Features } from 'new/services/FetureFlags/features';

export type FeatureFlagsType = { [key in Features]: boolean };

export const defaultFlags: FeatureFlagsType = {
  [Features.TestFeature]: false,
};
