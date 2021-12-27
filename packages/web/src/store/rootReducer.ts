import { combineReducers } from 'redux';

import global from 'store/slices/GlobalSlice';
import wallet from 'store/slices/wallet/WalletSlice';

export const rootReducer = combineReducers({
  global,
  wallet,
});

export type RootState = ReturnType<typeof rootReducer>;
