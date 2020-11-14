import web3 from '@solana/web3.js';
import { mergeRight } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { getRatesAction } from 'store/commands';

type State = {
  [market: string]: number;
};

const initialState: State = {};

export const ratesReducer = createReducer(initialState).handleAction(
  getRatesAction,
  (state, { payload }) => {
    const newState = payload.reduce(
      (prev, cur) => ({
        ...prev,
        [cur.data.market]: cur.data.bids[0].price,
      }),
      {},
    );
    return mergeRight(state, newState);
  },
);
