import * as web3 from '@solana/web3.js';
import { mergeRight, uniq } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { changeEntrypointAction, getPoolsProgramAccountsAsyncAction } from 'store/_commands';

export interface PoolInfo {
  pubkeys: {
    program: web3.PublicKey;
    account: web3.PublicKey;
    holdingAccounts: web3.PublicKey[];
    holdingMints: web3.PublicKey[];
    mint: web3.PublicKey;
    feeAccount?: web3.PublicKey;
  };
  raw: any;
}

type ItemsType = {
  [pubkey: string]: PoolInfo[];
};

type State = {
  items: ItemsType;
  order: string[];
};

const initialState: State = {
  items: {},
  order: [],
};

export const poolsReducer = createReducer(initialState)
  .handleAction(getPoolsProgramAccountsAsyncAction.success, (state, action) => {
    // TODO: normalizr if it will fit many cases
    const newItems: ItemsType = {};
    const newPubkeys: string[] = [];

    for (const item of action.payload) {
      newItems[item.pubkeys.account.toBase58()] = item;
      newPubkeys.push(item.pubkeys.account.toBase58());
    }

    return {
      items: mergeRight(state.items, newItems),
      order: uniq(state.order.concat(newPubkeys)),
    };
  })
  .handleAction(changeEntrypointAction, () => ({
    ...initialState,
  }));
