import { ThunkAction } from 'redux-thunk';
import { ActionType, StateType } from 'typesafe-actions';

import { rootReducer } from 'store/reducers';

export type RootAction = ActionType<typeof import('./commands')>;
export type RootState = StateType<typeof rootReducer>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, RootAction>;
export type AppAsyncThunk<ReturnType = void> = AppThunk<Promise<ReturnType>>;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}
