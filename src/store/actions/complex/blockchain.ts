import * as web3 from '@solana/web3.js';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';

import { getBalance } from 'store/actions/solana';
import {
  changeEntrypointAction,
  changeFeeCalculatorAction,
  changeMinBalanceForRentExceptionAction,
  createAccountAction,
} from 'store/commands';
import { AppAsyncThunk, AppThunk } from 'store/types';

import { ApiSolanaService } from '../../middlewares/solana-api/services';

export const establishConnection = (entrypoint?: string): AppAsyncThunk<void> => async (
  dispatch,
  getState,
) => {
  let entrypointUrl = entrypoint;
  if (!entrypointUrl) {
    entrypointUrl = getState().data.blockchain.entrypoint;
  }

  const connection = ApiSolanaService.changeEntrypoint(entrypointUrl).getConnection();

  try {
    const { feeCalculator } = await connection.getRecentBlockhash();
    const minBalanceForRentException: number = await connection.getMinimumBalanceForRentExemption(
      0,
    );

    dispatch(changeFeeCalculatorAction(feeCalculator));
    dispatch(changeMinBalanceForRentExceptionAction(minBalanceForRentException));

    const { account } = getState().data.blockchain;

    if (account) {
      dispatch(getBalance(account.publicKey));
    }

    localStorage.setItem('entrypoint', entrypointUrl);

    return Promise.resolve();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to establish connection', error);
    return Promise.reject();
  }
};

export const changeEntrypointAndConnect = (entrypoint: string): AppThunk => (dispatch) => {
  dispatch(changeEntrypointAction(entrypoint));
  void dispatch(establishConnection(entrypoint));
};

export const createAccount = (mnemonic: string): AppThunk => async (dispatch) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

  localStorage.setItem('secretKey', new TextEncoder('utf-8').encode(keyPair.secretKey.toString()));
  dispatch(createAccountAction(keyPair.secretKey));
};
