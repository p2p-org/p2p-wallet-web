import * as web3 from '@solana/web3.js';
import { mergeRight, uniq } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { getProgramAccountsAsyncAction } from 'store/commands';

type ItemsType = {
  [pubkey: string]: web3.AccountInfo<string>;
};

type State = {
  items: ItemsType;
  order: string[];
};

const initialState: State = {
  items: {},
  order: [],
};

export const tokensReducer = createReducer(initialState).handleAction(
  getProgramAccountsAsyncAction.success,
  (state, action) => {
    // TODO: normalizr if it will fit many cases
    const newItems: ItemsType = {};
    const newPubkeys: string[] = [];
    for (const { pubkey, account } of action.payload) {
      newItems[pubkey.toString()] = account;
      newPubkeys.push(pubkey.toString());
    }

    return {
      items: mergeRight(state.items, newItems),
      order: uniq(state.order.concat(newPubkeys)),
    };
  },
);
