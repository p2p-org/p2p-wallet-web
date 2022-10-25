import type { MapActionWithNoParams } from '../common';

type SwapComplexActions =
  | {
      name: 'Swap_Start_Screen';
      params: { Last_Screen: string | null };
    }
  | {
      name: 'Swap_Changing_Token_A';
      params: {
        Token_A_Name: string;
      };
    }
  | {
      name: 'Swap_Changing_Token_B';
      params: {
        Token_B_Name: string;
      };
    };

type SwapSimpleActionNames = null;

type SwapSimpleActions = MapActionWithNoParams<SwapSimpleActionNames>;

export type SwapActions = SwapSimpleActions | SwapComplexActions;
