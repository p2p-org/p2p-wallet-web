import type { BuyComplexActions, BuySimpleActions } from './Buy';
import type { ReceiveComplexActions, ReceiveSimpleActions } from './Receive';

type SimpleActions = BuySimpleActions | ReceiveSimpleActions;

export type ComplexActions = BuyComplexActions | ReceiveComplexActions;

export type AmplitudeActions = SimpleActions | ComplexActions;
