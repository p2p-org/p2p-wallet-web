import { combineReducers } from 'redux';

import { poolsReducer } from './pools';
import { ratesReducer } from './rates';
import { tokensReducer } from './tokens';
import { transactionsReducer } from './transactions';
import { transactionsNormalizedReducer } from './transactionsNormalized';

export const entitiesReducer = combineReducers({
  rates: ratesReducer,
  tokens: tokensReducer,
  pools: poolsReducer,
  transactions: transactionsReducer,
  transactionsNormalized: transactionsNormalizedReducer,
});
