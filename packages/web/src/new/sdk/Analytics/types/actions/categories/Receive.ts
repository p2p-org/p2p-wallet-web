import type { MapActionWithNoParams } from '../common';

type ReceiveComplexActions = {
  name: 'Receive_Start_Screen';
  params: { Last_Screen: string | null };
};

type ReceiveSimpleActionNames = 'Receive_Address_Copied';

type ReceiveSimpleActions = MapActionWithNoParams<ReceiveSimpleActionNames>;

export type ReceiveActions = ReceiveSimpleActions | ReceiveComplexActions;
