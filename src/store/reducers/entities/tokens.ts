import * as web3 from '@solana/web3.js';
import { mergeRight, uniq } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import {
  changeEntrypointAction,
  getProgramAccountsAsyncAction,
  getTokenAccountInfoAsyncAction,
} from 'store/commands';

type ItemsType = {
  [pubkey: string]: web3.AccountInfo<web3.ParsedAccountData>;
};

type State = {
  items: ItemsType;
  order: string[];
};

const initialState: State = {
  items: {},
  order: [],
};

export const tokensReducer = createReducer(initialState)
  .handleAction(getProgramAccountsAsyncAction.success, (state, action) => {
    // TODO: normalizr if it will fit many cases
    const newItems: ItemsType = {};
    const newPubkeys: string[] = [];

    for (const { pubkey, account } of action.payload) {
      if (new web3.PublicKey(String(account?.owner)).equals(TOKEN_PROGRAM_ID)) {
        newItems[pubkey.toString()] = account;
        newPubkeys.push(pubkey.toString());
      }
    }

    return {
      items: mergeRight(state.items, newItems),
      order: uniq(state.order.concat(newPubkeys)),
    };
  })
  .handleAction(getTokenAccountInfoAsyncAction.success, (state, { payload, meta }) => {
    // TODO: normalizr if it will fit many cases
    const newItems: ItemsType = {};
    const newPubkeys: string[] = [];
    const tokenPublicKey = new web3.PublicKey(String(payload?.owner.toBase58()));

    if (tokenPublicKey.equals(TOKEN_PROGRAM_ID) || tokenPublicKey.equals(SYSTEM_PROGRAM_ID)) {
      newItems[meta.publicKey.toBase58()] = payload;
      newPubkeys.push(meta.publicKey.toBase58());
    }

    return {
      items: mergeRight(state.items, newItems),
      order: uniq(state.order.concat(newPubkeys)),
    };
  })
  .handleAction(changeEntrypointAction, () => ({
    ...initialState,
  }));
