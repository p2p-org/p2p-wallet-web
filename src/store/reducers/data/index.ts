import { combineReducers } from 'redux';

import { blockchainReducer } from './blockchain';
import { tokensReducer } from './tokens';

export const dataReducer = combineReducers({
  blockchain: blockchainReducer,
  tokens: tokensReducer,
});
