import type { MapActionWithNoParams } from '../common';

type ReceiveComplexActions = {
  name: 'Receive_Start_Screen';
  params: { Last_Screen: string | null };
};

type ReceiveSimpleActionNames =
  | 'Receive_Address_Copied'
  | 'Receive_QR_Copied'
  | 'Receive_Solana_Explorer'
  | 'Receive_Bitcoin_Explorer'
  | 'Receive_Token_Info'
  | 'Receive_Bitcoin_Network'
  | 'Receive_Pay_Button';

type ReceiveSimpleActions = MapActionWithNoParams<ReceiveSimpleActionNames>;

export type ReceiveActions = ReceiveSimpleActions | ReceiveComplexActions;
