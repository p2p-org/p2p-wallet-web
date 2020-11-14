import * as web3 from '@solana/web3.js';

import { ACCOUNT_LAYOUT, MINT_LAYOUT, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { mintTestTokenAsyncAction, transferTokenAsyncAction } from 'store/commands';
import { SOLANA_API } from 'store/middlewares';
import { ApiSolanaService } from 'store/middlewares/solana-api/services';
import { AppThunk } from 'store/types';
import { memoInstruction } from 'store/utils/instructions/memoProgram';
import {
  initializeAccountInstruction,
  initializeMintInstruction,
  mintToInstruction,
  transfer,
} from 'store/utils/instructions/tokenProgram';
import { parseTokenAccountData } from 'utils/solana/parseData';

export const createAndInitializeMint = ({
  owner, // Account for paying fees and allowed to mint new tokens
  mint, // Account to hold token information
  amount, // Number of tokens to issue
  decimals,
  initialAccount, // Account to hold newly issued tokens, if amount > 0
}: {
  owner: web3.Account;
  mint: web3.Account;
  amount: number;
  decimals: number;
  initialAccount: web3.Account;
}): AppThunk => async (dispatch) => {
  const connection = ApiSolanaService.getConnection();

  const transaction = new web3.Transaction();

  const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_LAYOUT.span);

  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: owner.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: lamportsForMint,
      space: MINT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    initializeMintInstruction({
      mint: mint.publicKey,
      decimals,
      mintAuthority: owner.publicKey,
    }),
  );

  const signers = [owner, mint];

  if (amount > 0) {
    signers.push(initialAccount);

    const lamportsForAccount = await connection.getMinimumBalanceForRentExemption(
      ACCOUNT_LAYOUT.span,
    );

    transaction.add(
      web3.SystemProgram.createAccount({
        fromPubkey: owner.publicKey,
        newAccountPubkey: initialAccount.publicKey,
        lamports: lamportsForAccount,
        space: ACCOUNT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    transaction.add(
      initializeAccountInstruction({
        account: initialAccount.publicKey,
        mint: mint.publicKey,
        owner: owner.publicKey,
      }),
    );

    transaction.add(
      mintToInstruction({
        mint: mint.publicKey,
        destination: initialAccount.publicKey,
        amount,
        mintAuthority: owner.publicKey,
      }),
    );
  }

  return dispatch({
    [SOLANA_API]: {
      action: mintTestTokenAsyncAction,
      transaction,
      signers,
      options: {
        preflightCommitment: 'single',
      },
    },
  });
};

const createAndInitializeTokenAccount = ({
  payer,
  mintPublicKey,
  newAccount,
}: {
  payer: web3.Account;
  mintPublicKey: web3.PublicKey;
  newAccount: web3.Account;
}): AppThunk => async (dispatch) => {
  const transaction = new web3.Transaction();

  const lamportsForAccount = await ApiSolanaService.getConnection().getMinimumBalanceForRentExemption(
    ACCOUNT_LAYOUT.span,
  );

  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: lamportsForAccount,
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    initializeAccountInstruction({
      account: newAccount.publicKey,
      mint: mintPublicKey,
      owner: payer.publicKey,
    }),
  );

  return dispatch({
    [SOLANA_API]: {
      action: mintTestTokenAsyncAction,
      transaction,
      signers: [payer, newAccount],
      options: {
        preflightCommitment: 'single',
      },
    },
  });
};

export const createTokenAccount = (tokenAddress: web3.PublicKey): AppThunk => (
  dispatch,
  getState,
) => {
  const ownerAccount = getState().data.blockchain.account;

  if (!ownerAccount) {
    // TODO: check auth
    console.info('TODO: check auth');
  }

  return dispatch(
    createAndInitializeTokenAccount({
      payer: ownerAccount,
      mintPublicKey: tokenAddress,
      newAccount: new web3.Account(),
    }),
  );
};

const transferSol = ({
  destPublicKey,
  amount,
}: {
  destPublicKey: web3.PublicKey;
  amount: number;
}): AppThunk => async (dispatch, getState) => {
  const ownerAccount = getState().data.blockchain.account;

  if (!ownerAccount) {
    // TODO: check auth
    console.info('TODO: check auth');
  }

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: ownerAccount.publicKey,
      toPubkey: destPublicKey,
      lamports: amount,
    }),
  );

  const signers = [ownerAccount];

  return dispatch({
    [SOLANA_API]: {
      action: transferTokenAsyncAction,
      transaction,
      signers,
      options: {
        preflightCommitment: 'single',
      },
    },
  });
};

export const transferTokens = ({
  sourcePublicKey,
  destPublicKey,
  amount,
  memo,
}: {
  sourcePublicKey: web3.PublicKey;
  destPublicKey: web3.PublicKey;
  amount: number;
  memo?: string;
}): AppThunk => async (dispatch, getState) => {
  const ownerAccount = getState().data.blockchain.account;

  if (!ownerAccount) {
    // TODO: check auth
    console.info('TODO: check auth');
  }

  // if sol
  if (sourcePublicKey.equals(ownerAccount.publicKey)) {
    if (memo) {
      throw new Error('Memo not implemented');
    }

    return dispatch(transferSol({ destPublicKey, amount }));
  }

  const destAccountInfo = await ApiSolanaService.getConnection().getAccountInfo(destPublicKey);

  if (!destAccountInfo?.owner.equals(TOKEN_PROGRAM_ID)) {
    throw new Error('Not a token account');
  }

  const transaction = new web3.Transaction().add(
    transfer({
      source: sourcePublicKey,
      destination: destPublicKey,
      owner: ownerAccount.publicKey,
      amount,
    }),
  );

  if (memo) {
    transaction.add(memoInstruction(memo));
  }

  const signers = [ownerAccount];

  return dispatch({
    [SOLANA_API]: {
      action: transferTokenAsyncAction,
      transaction,
      signers,
      options: {
        preflightCommitment: 'single',
      },
    },
  });
};
