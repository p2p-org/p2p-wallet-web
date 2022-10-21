import type { BuyComplexActions, BuySimpleActions } from 'new/services/analytics/types/Buy';

type SimpleActions = BuySimpleActions;

export type ComplexActions = BuyComplexActions;

export type AmplitudeActions = SimpleActions | ComplexActions;
