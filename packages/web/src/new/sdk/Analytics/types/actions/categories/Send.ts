import type { MapActionWithNoParams } from '../common';

type SendComplexActions =
  | {
      name: 'Send_Start_Screen';
      params: { Last_Screen: string | null };
    }
  | {
      name: 'Send_USD_Button';
      params: {
        Mode: string;
      };
    }
  | {
      name: 'Send_Confirm_Button_Pressed';
      params: {
        Send_Network: string;
        Send_Currency: string;
        Send_Sum: number;
        Send_MAX: boolean;
        Send_USD: number;
        Send_Free: boolean;
        Send_Username: boolean;
        Send_Account_Fee_Token: string | null;
      };
    };

type SendSimpleActionNames = never;

type SendSimpleActions = MapActionWithNoParams<SendSimpleActionNames>;

export type SendActions = SendSimpleActions | SendComplexActions;
