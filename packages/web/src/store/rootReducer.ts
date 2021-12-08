import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import global from 'store/slices/GlobalSlice';
import transaction from 'store/slices/transaction/TransactionSlice';
import wallet from 'store/slices/wallet/WalletSlice';

export const rootReducer = combineReducers({
  global,
  transaction,
  wallet,
  modals,
});

export type RootState = ReturnType<typeof rootReducer>;
