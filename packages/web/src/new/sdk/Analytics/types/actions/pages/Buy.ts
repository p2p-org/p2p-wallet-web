import type { MapActionWithNoParams } from '../common';

type BuyComplexActions =
  | {
      name: 'Buy_Coin_Changed';
      params: { From_Coin: string; To_Coin: string };
    }
  | {
      name: 'Buy_Button_Pressed';
      params: { Sum_Currency: number; Sum_Coin: number; Currency: string; Coin: string };
    }
  | { name: 'Buy_Screen_Opened'; params: { Last_Screen: string | null } };

type BuySimpleActionNames = 'Moonpay_Window_Opened' | 'Unsupported_Region_Showed';

type BuySimpleActions = MapActionWithNoParams<BuySimpleActionNames>;

export type BuyActions = BuySimpleActions | BuyComplexActions;
