import * as web3 from '@solana/web3.js';
import { createAction, createAsyncAction } from 'typesafe-actions';

export const changeFeeCalculatorAction = createAction('changeFeeCalculator')<{
  lamportsPerSignature: number;
}>();

export const changeMinBalanceForRentExceptionAction = createAction(
  'changeMinBalanceForRentException',
)<number>();

export const connectionReadyAction = createAction('connectionReady')();

export const changeEntrypointAction = createAction('changeEntrypoint')<string>();

export const createAccountAction = createAction('createAccount')<Uint8Array>();

export const getBalanceAsyncAction = createAsyncAction(
  'SOLANA_GET_BALANCE_REQUEST',
  'SOLANA_GET_BALANCE_SUCCESS',
  'SOLANA_GET_BALANCE_FAILURE',
  'SOLANA_GET_BALANCE_CANCEL',
)<undefined, number, Error>();

export const getConfirmedSignaturesForAddressAsyncAction = createAsyncAction(
  'SOLANA_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_REQUEST',
  'SOLANA_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_SUCCESS',
  'SOLANA_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_FAILURE',
  'SOLANA_GET_CONFIRMED_SIGNATURES_FOR_ADDRESS_CANCEL',
)<unknown, [web3.ConfirmedSignatureInfo[], { publicKey: web3.PublicKey }], [Error]>();

export const getConfirmedTransactionAsyncAction = createAsyncAction(
  'SOLANA_GET_CONFIRMED_TRANSACTION_ACTION_REQUEST',
  'SOLANA_GET_CONFIRMED_TRANSACTION_ACTION_SUCCESS',
  'SOLANA_GET_CONFIRMED_TRANSACTION_ACTION_FAILURE',
  'SOLANA_GET_CONFIRMED_TRANSACTION_ACTION_CANCEL',
)<unknown, [web3.ConfirmedTransaction, { signature: web3.TransactionSignature }], Error>();

export const getProgramAccountsAsyncAction = createAsyncAction(
  'SOLANA_GET_PROGRAM_ACCOUNTS_REQUEST',
  'SOLANA_GET_PROGRAM_ACCOUNTS_SUCCESS',
  'SOLANA_GET_PROGRAM_ACCOUNTS_FAILURE',
  'SOLANA_GET_PROGRAM_ACCOUNTS_CANCEL',
)<unknown, Array<web3.PublicKeyAndAccount<string>>, Error>();

export const requestAirdropAsyncAction = createAsyncAction(
  'SOLANA_REQUEST_AIRDROP_REQUEST',
  'SOLANA_REQUEST_AIRDROP_SUCCESS',
  'SOLANA_REQUEST_AIRDROP_FAILURE',
  'SOLANA_REQUEST_AIRDROP_CANCEL',
)<undefined, string, Error>();

export const transferAsyncAction = createAsyncAction(
  'SOLANA_TRANSFER_REQUEST',
  'SOLANA_TRANSFER_SUCCESS',
  'SOLANA_TRANSFER_FAILURE',
  'SOLANA_TRANSFER_CANCEL',
)<undefined, string, Error>();

export const mintTestTokenAsyncAction = createAsyncAction(
  'SOLANA_MINT_TEST_TOKEN_REQUEST',
  'SOLANA_MINT_TEST_TOKEN_SUCCESS',
  'SOLANA_MINT_TEST_TOKEN_FAILURE',
  'SOLANA_MINT_TEST_TOKEN_CANCEL',
)<undefined, string, Error>();
