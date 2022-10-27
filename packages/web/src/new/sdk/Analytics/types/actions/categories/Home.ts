import type { MapActionWithNoParams } from '../common';

type HomeComplexActions = never;

type HomeSimpleActionNames = 'Wallets_Buy_Button' | 'Wallets_Receive_Button';

type HomeSimpleActions = MapActionWithNoParams<HomeSimpleActionNames>;

export type HomeActions = HomeSimpleActions | HomeComplexActions;
