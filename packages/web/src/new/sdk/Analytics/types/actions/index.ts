import type { WithLastScreenActionNames } from './common';
import type { BuyActions, ReceiveActions, SendActions, SwapActions } from './pages';

export type AmplitudeActions = BuyActions | ReceiveActions | SendActions | SwapActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
