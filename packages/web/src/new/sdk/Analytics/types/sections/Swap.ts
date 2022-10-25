import type { MapActionWithNoParams } from '../common';

type SwapComplexActions = {
  name: 'Swap_Start_Screen';
  params: { Last_Screen: string | null };
};

type SwapSimpleActionNames = 'Swap_Address_Copied';

type SwapSimpleActions = MapActionWithNoParams<SwapSimpleActionNames>;

export type SwapActions = SwapSimpleActions | SwapComplexActions;
