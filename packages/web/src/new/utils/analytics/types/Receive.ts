import type { MapActionWithNoParams } from 'new/utils/analytics/types/common';

export type ReceiveComplexActions = {
  name: 'Receive_Start_Screen';
  params: { Last_Screen: string | null };
};

type ReceiveActions = 'Receive_Address_Copied';

export type ReceiveSimpleActions = MapActionWithNoParams<ReceiveActions>;
