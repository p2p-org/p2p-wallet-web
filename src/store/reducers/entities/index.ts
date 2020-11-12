import { combineReducers } from 'redux';

import { tokensReducer } from './tokens';
import { transactionsReducer } from './transactions';
import { transactionsNormalizedReducer } from './transactionsNormalized';

export const entitiesReducer = combineReducers({
  tokens: tokensReducer,
  transactions: transactionsReducer,
  transactionsNormalized: transactionsNormalizedReducer,
});
