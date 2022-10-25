import type { MapActionWithNoParams } from '../common';

type SendComplexActions = {
  name: 'Send_Start_Screen';
  params: { Last_Screen: string | null };
};

type SendSimpleActionNames = 'Send_Filling_Address' | 'Send_Review_Screen';

type SendSimpleActions = MapActionWithNoParams<SendSimpleActionNames>;

export type SendActions = SendSimpleActions | SendComplexActions;
