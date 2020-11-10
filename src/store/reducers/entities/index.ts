import { combineReducers } from 'redux';

import { tokensReducer } from './tokens';

export const entitiesReducer = combineReducers({
  tokens: tokensReducer,
});
