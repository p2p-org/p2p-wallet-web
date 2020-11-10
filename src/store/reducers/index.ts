import { combineReducers } from 'redux';
import { modalsReducer as modals } from 'redux-modals-manager';

import { dataReducer } from './data';
import { entitiesReducer } from './entities';

export const rootReducer = combineReducers({
  data: dataReducer,
  entities: entitiesReducer,
  modals,
});
