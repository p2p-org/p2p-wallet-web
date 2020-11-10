import web3 from '@solana/web3.js';
import { ThunkAction } from 'redux-thunk';
import { ActionType, StateType } from 'typesafe-actions';

import { rootReducer } from 'store/reducers';

type TokenAccount = web3.AccountInfo<string> & {
  parsed: { mint?: web3.PublicKey; owner?: web3.PublicKey; amount?: number };
};

export type RootAction = ActionType<typeof import('./commands')>;
export type RootState = StateType<typeof rootReducer>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, RootAction>;
export type AppAsyncThunk<ReturnType = void> = AppThunk<Promise<ReturnType>>;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}
