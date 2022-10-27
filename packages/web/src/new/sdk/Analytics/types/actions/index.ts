import type { WithLastScreenActionNames } from './common';
import type { BuyActions, HomeActions, ReceiveActions, SendActions, SwapActions } from './pages';

export type AmplitudeActions =
  | HomeActions
  | BuyActions
  | ReceiveActions
  | SendActions
  | SwapActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
