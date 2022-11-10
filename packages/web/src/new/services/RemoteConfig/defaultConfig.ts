import type { FeatureFlagsType } from 'new/services/FeatureFlags/defaultFlags';
import { defaultFlags } from 'new/services/FeatureFlags/defaultFlags';

export enum ConfigKeys {
  NetworkSettings = 'web_NetworkSettings',
  UsernameDomain = 'web_UsernameDomain',
}

type DefaultConfigType = FeatureFlagsType | Record<ConfigKeys, string | number | boolean>;

export const defaultConfig: DefaultConfigType = {
  [ConfigKeys.NetworkSettings]: '[]',
  [ConfigKeys.UsernameDomain]: '.key',

  ...defaultFlags,
};
