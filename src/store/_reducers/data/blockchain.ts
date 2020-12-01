import * as web3 from '@solana/web3.js';
import { createReducer } from 'typesafe-actions';

import { NETWORKS } from 'config/constants';
import {
  changeEntrypointAction,
  changeFeeCalculatorAction,
  changeMinBalanceForRentExceptionAction,
  connectionReadyAction,
  createAccountAction,
  getBalanceAsyncAction,
  requestAirdropAsyncAction,
} from 'store/_commands';

type State = {
  readonly connectionReady: boolean;
  readonly entrypoint: string;
  readonly feeCalculator: { lamportsPerSignature: number } | undefined;
  readonly minBalanceForRentException: number | undefined;
  readonly secretKey: Uint8Array | undefined;
  readonly account: web3.Account | undefined;
  readonly balanceLamportsStatus: 'idle' | 'pending' | 'success' | 'failure';
  readonly balanceLamports: number;
  readonly airdropStatus: 'idle' | 'pending' | 'success' | 'failure';
};

const initialState: State = {
  connectionReady: false,
  entrypoint: localStorage.getItem('entrypoint') || NETWORKS[0].endpoint,
  feeCalculator: undefined,
  minBalanceForRentException: undefined,
  secretKey: localStorage.getItem('secretKey') || undefined,
  account: localStorage.getItem('secretKey')
    ? new web3.Account(new Uint8Array(JSON.parse(localStorage.getItem('secretKey'))))
    : undefined,
  balanceLamportsStatus: 'idle',
  balanceLamports: 0,
  airdropStatus: 'idle',
};

export const blockchainReducer = createReducer(initialState)
  .handleAction(connectionReadyAction, (state, action) => ({
    ...state,
    connectionReady: true,
  }))
  .handleAction(changeEntrypointAction, (state, action) => ({
    ...initialState,
    connectionReady: true,
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
    balanceLamportsStatus: 'pending',
  }))
  .handleAction(getBalanceAsyncAction.success, (state, action) => ({
    ...state,
    balanceLamportsStatus: 'success',
    balanceLamports: action.payload,
  }))
  .handleAction(getBalanceAsyncAction.failure, (state) => ({
    ...state,
    balanceLamportsStatus: 'failure',
  }))
  // requestAirdropAction
  .handleAction(requestAirdropAsyncAction.request, (state) => ({
    ...state,
    airdropStatus: 'pending',
    balanceLamportsStatus: 'pending',
  }))
  .handleAction(requestAirdropAsyncAction.success, (state) => ({
    ...state,
    airdropStatus: 'success',
  }))
  .handleAction(requestAirdropAsyncAction.failure, (state) => ({
    ...state,
    airdropStatus: 'failure',
  }));
