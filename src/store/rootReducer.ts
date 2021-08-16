import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import global from 'store/slices/GlobalSlice';
import pool from 'store/slices/pool/PoolSlice';
import rate from 'store/slices/rate/RateSlice';
import tokenPair from 'store/slices/tokenPair/TokenPairSlice';
import transaction from 'store/slices/transaction/TransactionSlice';
import wallet from 'store/slices/wallet/WalletSlice';

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
