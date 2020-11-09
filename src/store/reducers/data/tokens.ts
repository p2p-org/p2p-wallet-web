import { createReducer } from 'typesafe-actions';

import { changeEntrypointAction } from 'store/actions';

type State = {
  readonly entrypoint: string;
};

const initialState: State = {};

export const tokensReducer = createReducer(initialState).handleAction(
  changeEntrypointAction,
  (state, action) => ({
    ...initialState,
  }),
);
