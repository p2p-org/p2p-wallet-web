import type {
  BuyActions,
  ErrorActions,
  GeneralActions,
  HomeActions,
  ReceiveActions,
  SendActions,
  SwapActions,
} from './categories';
import type { WithLastScreenActionNames } from './common';

export type AmplitudeActions =
  | GeneralActions
  | HomeActions
  | BuyActions
  | ReceiveActions
  | SendActions
  | SwapActions
  | ErrorActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
