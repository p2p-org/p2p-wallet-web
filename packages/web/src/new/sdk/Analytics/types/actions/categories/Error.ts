import type { MapActionWithNoParams } from '../common';

type ErrorComplexActions = {
  name: 'Error_Showed';
  params: { Current_Screen: string; Code: string; Description: string };
};

type ErrorSimpleActionNames = never;

type ErrorSimpleActions = MapActionWithNoParams<ErrorSimpleActionNames>;

export type ErrorActions = ErrorSimpleActions | ErrorComplexActions;
