export type BuyAmplitudeActions =
  | {
      name: 'Buy_Coin_Changed';
      params: { From_Coin: string; To_Coin: string };
    }
  | { name: 'Buy_Total_Showed'; params: { Showed: boolean } }
  | {
      name: 'Buy_Button_Pressed';
      params: { Sum_Currency: number; Sum_Coin: number; Currency: string; Coin: string };
    }
  | { name: 'Moonpay_Window' }
  | { name: 'Moonpay_Window_Closed' };
