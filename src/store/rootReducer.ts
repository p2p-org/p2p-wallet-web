import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import global from 'features/GlobalSlice';
import pool from 'features/pool/PoolSlice';
import tokenPair from 'features/tokenPair/TokenPairSlice';
import wallet from 'features/wallet/WalletSlice';

export const rootReducer = combineReducers({
  global,
  pool,
  tokenPair,
  wallet,
  modals,
});

export type RootState = ReturnType<typeof rootReducer>;
