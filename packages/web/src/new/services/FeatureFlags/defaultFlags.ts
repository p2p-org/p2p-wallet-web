import { Features } from './features';

export type FeatureFlagsType = Record<Features, boolean>;

export const defaultFlags: FeatureFlagsType = {
  [Features.LeftNavMenuProfile]: false,
  [Features.ShowAllSettings]: true,
  [Features.ShowDevnet]: false,
  [Features.LogAmplitudeEvents]: false,
};
