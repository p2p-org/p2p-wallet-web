import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import global from 'features/GlobalSlice';
import pool from 'features/pool/PoolSlice';
import rate from 'features/rate/RateSlice';
import tokenPair from 'features/tokenPair/TokenPairSlice';
import transaction from 'features/transaction/TransactionSlice';
import wallet from 'features/wallet/WalletSlice';

export const rootReducer = combineReducers({
  global,
  pool,
  rate,
  tokenPair,
  transaction,
  wallet,
  modals,
});

export type RootState = ReturnType<typeof rootReducer>;
