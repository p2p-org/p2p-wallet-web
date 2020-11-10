import * as web3 from '@solana/web3.js';

import { ACCOUNT_LAYOUT, MINT_LAYOUT, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { mintTestTokenAsyncAction } from 'store/commands';
import { SOLANA_API } from 'store/middlewares';
import { ApiSolanaService } from 'store/middlewares/solana-api/services';
import { AppThunk } from 'store/types';
import {
  initializeAccountInstruction,
  initializeMintInstruction,
  mintToInstruction,
} from 'store/utils/instructions/tokenProgram';

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
}): AppThunk => async (dispatch, getState) => {
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

  // const result = connection.sendTransaction(transaction, signers, {
  //   preflightCommitment: 'single',
  // });

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
