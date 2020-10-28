import * as web3 from '@solana/web3.js';
import { createReducer } from 'typesafe-actions';

import { NETWORKS } from 'config/constants';
import {
  changeEntrypointAction,
  changeFeeCalculatorAction,
  changeMinBalanceForRentExceptionAction,
  createAccountAction,
  getBalanceAsyncAction,
  getConfirmedSignaturesForAddressAsyncAction,
  getConfirmedTransactionAsyncAction,
  requestAirdropAsyncAction,
} from 'store/actions';

type State = {
  readonly entrypoint: string;
  readonly feeCalculator: { lamportsPerSignature: number } | undefined;
  readonly minBalanceForRentException: number | undefined;
  readonly secretKey: Uint8Array | undefined;
  readonly account: web3.Account | undefined;
  readonly balanceStatus: 'idle' | 'pending' | 'success' | 'failure';
  readonly balance: number;
  readonly airdropStatus: 'idle' | 'pending' | 'success' | 'failure';
  readonly transactions: web3.ConfirmedSignatureInfo[];
  readonly transactionsNormalized: {
    [signature: string]: web3.ConfirmedTransaction;
  };
};

const initialState: State = {
  entrypoint: localStorage.getItem('entrypoint') || NETWORKS[0].url,
  feeCalculator: undefined,
  minBalanceForRentException: undefined,
  secretKey: undefined,
  account: undefined,
  balanceStatus: 'idle',
  balance: 0,
  airdropStatus: 'idle',
  transactions: [],
  transactionsNormalized: {},
};

export const blockchainReducer = createReducer(initialState)
  .handleAction(changeEntrypointAction, (state, action) => ({
    ...initialState,
    secretKey: state.secretKey,
    account: state.account,
    entrypoint: action.payload,
  }))
  .handleAction(changeFeeCalculatorAction, (state, action) => ({
    ...state,
    feeCalculator: action.payload,
  }))
  .handleAction(changeMinBalanceForRentExceptionAction, (state, action) => ({
    ...state,
    minBalanceForRentException: action.payload,
  }))
  .handleAction(createAccountAction, (state, action) => ({
    ...state,
    secretKey: action.payload,
    account: new web3.Account(action.payload),
  }))
  // getBalanceAction
  .handleAction(getBalanceAsyncAction.request, (state) => ({
    ...state,
    balanceStatus: 'pending',
  }))
  .handleAction(getBalanceAsyncAction.success, (state, action) => ({
    ...state,
    balanceStatus: 'success',
    balance: action.payload,
  }))
  .handleAction(getBalanceAsyncAction.failure, (state) => ({
    ...state,
    balanceStatus: 'failure',
  }))
  // requestAirdropAction
  .handleAction(requestAirdropAsyncAction.request, (state) => ({
    ...state,
    airdropStatus: 'pending',
    balanceStatus: 'pending',
  }))
  .handleAction(requestAirdropAsyncAction.success, (state) => ({
    ...state,
    airdropStatus: 'success',
  }))
  .handleAction(requestAirdropAsyncAction.failure, (state) => ({
    ...state,
    airdropStatus: 'failure',
  }))
  // getConfirmedSignaturesForAddressAction
  .handleAction(getConfirmedSignaturesForAddressAsyncAction.success, (state, action) => ({
    ...state,
    transactions: [...state.transactions, ...action.payload],
  }))
  .handleAction(getConfirmedTransactionAsyncAction.success, (state, action) => ({
    ...state,
    transactionsNormalized: {
      ...state.transactionsNormalized,
      [action.meta.signature]: {
        ...action.payload,
      },
    },
  }));
