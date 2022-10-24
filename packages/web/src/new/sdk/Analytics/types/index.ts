import type { WithLastScreenActionNames } from './common';
import type { BuyActions, ReceiveActions } from './sections';

export type AmplitudeActions = BuyActions | ReceiveActions;

export type OpenPageActionNames = WithLastScreenActionNames<AmplitudeActions>;
