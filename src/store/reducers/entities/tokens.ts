import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';
import { mergeRight, uniq } from 'ramda';
import { createReducer } from 'typesafe-actions';

import { TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { getProgramAccountsAsyncAction } from 'store/commands';
import { TokenAccount } from 'store/types';
import { parseTokenAccountData } from 'utils/solana/parseData';

type ItemsType = {
  [pubkey: string]: TokenAccount;
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
      const parsed: {
        mint?: web3.PublicKey;
        owner?: web3.PublicKey;
        amount?: number;
      } = new web3.PublicKey(String(account?.owner)).equals(TOKEN_PROGRAM_ID)
        ? parseTokenAccountData(bs58.decode(account.data))
        : {};

      newItems[pubkey.toString()] = {
        ...account,
        parsed,
      };
      newPubkeys.push(pubkey.toString());
    }

    return {
      items: mergeRight(state.items, newItems),
      order: uniq(state.order.concat(newPubkeys)),
    };
  },
);
