import type { MapActionWithNoParams } from 'new/services/analytics/types/common';

export type BuyComplexActions =
  | {
      name: 'Buy_Coin_Changed';
      params: { From_Coin: string; To_Coin: string };
    }
  | { name: 'Buy_Total_Showed'; params: { Showed: boolean } }
  | {
      name: 'Buy_Button_Pressed';
      params: { Sum_Currency: number; Sum_Coin: number; Currency: string; Coin: string };
    }
  | { name: 'Buy_Screen_Opened'; params: { Last_Screen: string } };

type BuyActions = 'Moonpay_Window' | 'Moonpay_Window_Closed';

export type BuySimpleActions = MapActionWithNoParams<BuyActions>;
