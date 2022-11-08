import type { MapActionWithNoParams } from '../common';

type GeneralComplexActions = never;

type GeneralSimpleActionNames = 'Appstore_Click_Button' | 'Google_Click_Button';

type GeneralSimpleActions = MapActionWithNoParams<GeneralSimpleActionNames>;

export type GeneralActions = GeneralSimpleActions | GeneralComplexActions;
