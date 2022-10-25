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
    }
  | {
      name: 'Swap_Approve_Button';
      params: {
        Token_A: string;
        Token_B: string;
        Swap_Sum: number;
        Swap_MAX: boolean;
        Swap_USD: number;
      };
    };

type SwapSimpleActionNames = 'Swap_Review_Button';

type SwapSimpleActions = MapActionWithNoParams<SwapSimpleActionNames>;

export type SwapActions = SwapSimpleActions | SwapComplexActions;
