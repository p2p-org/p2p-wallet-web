import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import { dataReducer } from './data';

export const rootReducer = combineReducers({
  data: dataReducer,
  modals,
});
