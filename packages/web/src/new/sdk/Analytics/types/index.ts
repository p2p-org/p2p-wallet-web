import type { WithLastScreenActionNames } from './common';
import type { BuyActions, ReceiveActions, SendActions } from './sections';

export type AmplitudeActions = BuyActions | ReceiveActions | SendActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
