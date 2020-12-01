import * as web3 from '@solana/web3.js';

import {
  ACCOUNT_LAYOUT,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from 'constants/solana/bufferLayouts';
import {
  getBalanceAsyncAction,
  getConfirmedSignaturesForAddressAsyncAction,
  getConfirmedTransactionAsyncAction,
  getProgramAccountsAsyncAction,
  getTokenAccountInfoAsyncAction,
  requestAirdropAsyncAction,
  transferAsyncAction,
} from 'store/_commands';
import { SOLANA_API } from 'store/_middlewares';
import { ApiSolanaService } from 'store/_middlewares/solana-api/services';
import { AppThunk } from 'store/types';
import { sleep } from 'utils/common';

export const transfer = (toPublicKey: string, lamports: number): AppThunk => (
  dispatch,
  getState,
) => {
  const fromPubkey = getState().data.blockchain.account?.publicKey;

  if (!fromPubkey) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey,
      toPubkey: new web3.PublicKey(toPublicKey),
      lamports,
    }),
  );

  return dispatch({
    [SOLANA_API]: {
      action: transferAsyncAction,
      transaction,
    },
  });
};

export const getBalance = (publicKey: web3.PublicKey): AppThunk => async (dispatch) => {
  try {
    dispatch(getBalanceAsyncAction.request());
    const result = await ApiSolanaService.getConnection().getBalance(publicKey);
    return dispatch(getBalanceAsyncAction.success(result));
  } catch (error) {
    return dispatch(getBalanceAsyncAction.failure(error));
  }
};

export const getMyBalance = (): AppThunk => (dispatch, getState) => {
  const publicKey = getState().data.blockchain.account?.publicKey;

  if (!publicKey) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  return dispatch(getBalance(publicKey));
};

// For testnet
export const requestAirdrop = (): AppThunk => async (dispatch, getState) => {
  const { account, feeCalculator, minBalanceForRentException } = getState().data.blockchain;
  const publicKey = account?.publicKey;

  if (!publicKey) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  let amount = 100000000;
  if (feeCalculator && feeCalculator.lamportsPerSignature && minBalanceForRentException) {
    // Drop enough to create 100 rent exempt accounts, that should be plenty
    amount = 100 * (feeCalculator.lamportsPerSignature + minBalanceForRentException);
  }

  try {
    dispatch(requestAirdropAsyncAction.request());
    const result = await ApiSolanaService.getConnection().requestAirdrop(publicKey, amount);
    dispatch(requestAirdropAsyncAction.success(result));
  } catch (error) {
    dispatch(requestAirdropAsyncAction.failure(error));
  } finally {
    // wait transaction
    await sleep(1000);

    // update balance info and on failure cause of fee
    dispatch(getBalance(publicKey));
  }
};

export const getConfirmedSignaturesForAddress = (
  publicKey: web3.PublicKey,
  options?: web3.ConfirmedSignaturesForAddress2Options,
): AppThunk => async (dispatch) => {
  try {
    const result = await ApiSolanaService.getConnection().getConfirmedSignaturesForAddress2(
      publicKey,
      options,
    );

    dispatch(getConfirmedSignaturesForAddressAsyncAction.success(result, { publicKey }));
  } catch (error) {
    dispatch(getConfirmedSignaturesForAddressAsyncAction.failure(error));
  }
};

export const getMyConfirmedSignaturesForAddress = (
  options?: web3.ConfirmedSignaturesForAddress2Options,
): AppThunk => (dispatch, getState) => {
  const publicKey = getState().data.blockchain.account?.publicKey;

  if (!publicKey) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  return dispatch(getConfirmedSignaturesForAddress(publicKey, options));
};

export const getConfirmedTransaction = (signature: web3.TransactionSignature): AppThunk => async (
  dispatch,
) => {
  try {
    const result = await ApiSolanaService.getConnection().getParsedConfirmedTransaction(signature);
    dispatch(getConfirmedTransactionAsyncAction.success(result, { signature }));

    return result;
  } catch (error) {
    dispatch(getConfirmedTransactionAsyncAction.failure(error));
  }
};

export const getTokenAccountInfo = (
  publicKey: web3.PublicKey,
  commitment?: web3.Commitment,
): AppThunk => async (dispatch, getState) => {
  dispatch(getTokenAccountInfoAsyncAction.request());
  try {
    const result = await ApiSolanaService.getConnection()?.getParsedAccountInfo(
      publicKey,
      commitment,
    );

    if (!result.value) {
      const currentPublicKey = getState().data.blockchain.account?.publicKey;

      if (publicKey.equals(currentPublicKey)) {
        const fakeResult: web3.AccountInfo = {
          owner: SYSTEM_PROGRAM_ID,
          lamports: 0,
        };

        dispatch(getTokenAccountInfoAsyncAction.success(fakeResult, { publicKey }));
        return;
      }
    }

    dispatch(getTokenAccountInfoAsyncAction.success(result.value, { publicKey }));
  } catch (error) {
    console.error('Failed to establish connection', error);
    dispatch(getTokenAccountInfoAsyncAction.failure(error));
  }
};

export const getProgramAccounts = (
  programId: web3.PublicKey,
  commitment?: web3.Commitment,
  filters?: any,
): AppThunk => async (dispatch) => {
  dispatch(getProgramAccountsAsyncAction.request());
  try {
    // const result = await ApiSolanaService.getConnection().getProgramAccounts(programId, commitment);
    const result = await ApiSolanaService.getConnection()._rpcRequest('getProgramAccounts', [
      programId.toBase58(),
      {
        commitment,
        filters,
        encoding: 'jsonParsed',
      },
    ]);

    if (result.error) {
      throw new Error(result.error);
    }

    dispatch(getProgramAccountsAsyncAction.success(result.result));
  } catch (error) {
    dispatch(getProgramAccountsAsyncAction.failure(error.toString()));
  }
};

export const getOwnedTokenAccounts = (): AppThunk => (dispatch, getState) => {
  const publicKey = getState().data.blockchain.account?.publicKey;
  const commitment = ApiSolanaService.getConnection()?.commitment;

  if (!publicKey) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  return dispatch(
    getProgramAccounts(TOKEN_PROGRAM_ID, commitment, [
      {
        memcmp: {
          offset: ACCOUNT_LAYOUT.offsetOf('owner'),
          bytes: publicKey.toBase58(),
        },
      },
      {
        dataSize: ACCOUNT_LAYOUT.span,
      },
    ]),
  );
};
