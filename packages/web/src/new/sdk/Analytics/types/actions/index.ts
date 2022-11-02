import type {
  BuyActions,
  ErrorActions,
  GeneralActions,
  HomeActions,
  OnboardingActions,
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
  | ErrorActions
  | OnboardingActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
