import web3 from '@solana/web3.js';
import { mergeRight, pathOr, uniq } from 'ramda';
import { createReducer } from 'typesafe-actions';
import u from 'updeep';

import {
  changeEntrypointAction,
  getConfirmedSignaturesForAddressAsyncAction,
} from 'store/commands';

type ItemsType = {
  [pubkey: string]: web3.ConfirmedSignatureInfo;
};

type State = {
  [pubkey: string]: {
    items: ItemsType;
    order: string[];
  };
};

const initialState: State = {};

export const transactionsReducer = createReducer(initialState)
  .handleAction(getConfirmedSignaturesForAddressAsyncAction.success, (state, { payload, meta }) => {
    // // TODO: normalizr if it will fit many cases
    const newItems: ItemsType = {};
    const newPubkeys: string[] = [];

    for (const transaction of payload) {
      newItems[transaction.signature.toString()] = transaction;
      newPubkeys.push(transaction.signature.toString());
    }

    return u.updateIn(
      meta.publicKey.toBase58(),
      {
        items: mergeRight(
          pathOr<ItemsType>({}, [meta.publicKey.toBase58(), 'items'], state),
          newItems,
        ),
        order: uniq(
          pathOr<string[]>([], [meta.publicKey.toBase58(), 'order'], state).concat(newPubkeys),
        ),
      },
      state,
    ) as State;
  })
  .handleAction(changeEntrypointAction, () => ({
    ...initialState,
  }));
