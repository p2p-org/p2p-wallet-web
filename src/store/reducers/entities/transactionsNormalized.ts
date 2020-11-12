import web3 from '@solana/web3.js';
import { mergeRight } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { getConfirmedTransactionAsyncAction } from 'store/commands';

type State = {
  [pubkey: string]: web3.ConfirmedTransaction;
};

const initialState: State = {};

export const transactionsNormalizedReducer = createReducer(initialState).handleAction(
  getConfirmedTransactionAsyncAction.success,
  (state, { payload, meta }) => {
    return mergeRight(state, { [meta.signature]: payload });
  },
);
