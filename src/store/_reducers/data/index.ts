import { combineReducers } from 'redux';

import { blockchainReducer } from './blockchain';

export const dataReducer = combineReducers({
  blockchain: blockchainReducer,
});
