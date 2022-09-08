import type { FeatureFlagsType } from 'new/services/FeatureFlags/defaultFlags';
import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';

export enum ConfigKeys {
  NetworkSettings = 'web_NetworkSettings',
}

type DefaultConfigType = FeatureFlagsType | Record<ConfigKeys, string | number | boolean>;

export const defaultConfig: DefaultConfigType = {
  [ConfigKeys.NetworkSettings]: '[]',

  ...defaultFlags,
};
