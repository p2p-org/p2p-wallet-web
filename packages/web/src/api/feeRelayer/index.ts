import { Token as SPLToken } from '@solana/spl-token';
import type { Account, SignaturePubkeyPair, TransactionInstruction } from '@solana/web3.js';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { memoizeWith, toString } from 'ramda';

import { getConnection } from 'api/connection';
import type { TransferParameters } from 'api/token';
import { ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'api/token';
import type { TokenAccount } from 'api/token/TokenAccount';
import { getWallet } from 'api/wallet';
import type { NetworkType } from 'config/constants';
import { feeRelayerUrl } from 'config/constants';
// import { WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';

export const KNOWN_FEE_PAYER_PUBKEYS = new Set(['FG4Y3yX4AAchp1HvNZ7LfzFTewF2f6nDoMDCohTFrdpT']);

type TransferSolParams = {
  sender_pubkey: string;
  recipient_pubkey: string;
  lamports: number;
};

type TransferSPLTokenParams = {
  sender_token_account_pubkey: string;
  recipient_pubkey: string;
  token_mint_pubkey: string;
  authority_pubkey: string;
  amount: number;
  decimals: number;
};

type SwapData = {
  account_pubkey: string;
  authority_pubkey: string;
  transfer_authority_pubkey: string;
  source_pubkey: string;
  destination_pubkey: string;
  pool_token_mint_pubkey: string;
  pool_fee_account_pubkey: string;
  amount_in: number;
  minimum_amount_out: number;
};

type SwapParams = {
  user_source_token_account_pubkey: string;
  user_destination_pubkey: string;
  source_token_mint_pubkey: string;
  destination_token_mint_pubkey: string;
  user_authority_pubkey: string;
  user_swap: SwapData;
  fee_compensation_swap: SwapData;
  fee_payer_wsol_account_keypair: string;
};

type InstructionsAndParams = {
  instructions: TransactionInstruction[];
  params: TransferSolParams | TransferSPLTokenParams | SwapParams;
  path: string;
  signers?: Account[];
};

export interface API {
  transfer: (parameters: TransferParameters, tokenAccount: TokenAccount) => Promise<string>;
  // swap: (parameters: SwapParameters & { feeCompensationPool: Pool }) => Promise<string>;
}

const getFeePayerPubkey = async (): Promise<PublicKey> => {
  try {
    const res = await fetch(`${feeRelayerUrl}/fee_payer/pubkey`);

    if (!res.ok) {
      throw new Error('getFeePayerPubkey something wrong');
    }

    const result = await res.text();

    return new PublicKey(result);
  } catch (error) {
    throw new Error(`Can't get fee payer pubkey: ${error}`);
  }
};

const sendTransaction = async (
  path: string,
  params: (TransferSolParams | TransferSPLTokenParams | SwapParams) & {
    signature: string;
    blockhash: string;
  },
): Promise<string> => {
  const options = {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await fetch(`${feeRelayerUrl}${path}`, options);

    if (!res.ok) {
      throw new Error('sendTransaction something wrong');
    }

    const result = await res.text();

    return result.replace(/[[\]']+/g, '');
  } catch (error) {
    throw new Error(`Can't send transaction: ${error}`);
  }
};

const makeTransferSolInstructionAndParams = (
  parameters: TransferParameters,
): InstructionsAndParams => {
  const { source, destination, amount } = parameters;

  return {
    instructions: [
      SystemProgram.transfer({
        fromPubkey: source,
        toPubkey: destination,
        lamports: amount,
      }),
    ],
    params: {
      sender_pubkey: source.toBase58(),
      lamports: amount,
      recipient_pubkey: destination.toBase58(),
    },
    path: '/transfer_sol',
  };
};

const makeTransferTokenInstructionAndParams = (
  parameters: TransferParameters,
  tokenAccount: TokenAccount,
): InstructionsAndParams => {
  const { source, destination, amount } = parameters;

  return {
    instructions: [
      // TODO: wait for d.ts for SPLToken and remove after that
      // @ts-ignore
      SPLToken.createTransferCheckedInstruction(
        TOKEN_PROGRAM_ID,
        source,
        tokenAccount.mint.address,
        destination,
        tokenAccount.owner,
        [],
        amount,
        tokenAccount.mint.decimals,
      ),
    ],
    params: {
      sender_token_account_pubkey: source.toBase58(),
      recipient_pubkey: destination.toBase58(),
      token_mint_pubkey: tokenAccount.mint.address.toBase58(),
      authority_pubkey: tokenAccount.owner.toBase58(),
      amount,
      decimals: tokenAccount.mint.decimals,
    },
    path: '/transfer_spl_token',
  };
};

const getSignedTransacton = async (
  transaction: Transaction,
  signers: Account[],
): Promise<{ transaction: Transaction; signerPublicKey: PublicKey }> => {
  if (signers.length > 0) {
    transaction.sign(
      ...signers.map((signer) => ({
        publicKey: signer.publicKey,
        secretKey: signer.secretKey,
      })),
    );

    return { transaction, signerPublicKey: signers[0].publicKey };
  }

  return { transaction: await getWallet().sign(transaction), signerPublicKey: getWallet().pubkey };
};

export const APIFactory = memoizeWith(toString, (network: NetworkType): API => {
  const connection = getConnection(network);

  const makeTransaction = async (
    feePayer: PublicKey,
    instructions: TransactionInstruction[],
    signers: Account[],
  ) => {
    const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

    const transaction = new Transaction({
      recentBlockhash,
      feePayer,
    });
    transaction.add(...instructions);

    const { transaction: signedTransacton, signerPublicKey } = await getSignedTransacton(
      transaction,
      signers,
    );

    const signaturePubkeyPair = signedTransacton.signatures.find((sign: SignaturePubkeyPair) =>
      sign.publicKey.equals(signerPublicKey),
    );

    return {
      blockhash: recentBlockhash,
      signature: bs58.encode(signaturePubkeyPair?.signature || []),
    };
  };

  const getTransferTokenInstructionAndParams = async (
    parameters: TransferParameters,
    tokenAccount: TokenAccount,
    feePayer: PublicKey,
  ): Promise<InstructionsAndParams> => {
    const destinationAccountInfo = await connection.getAccountInfo(parameters.destination);

    if (destinationAccountInfo && destinationAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      return makeTransferTokenInstructionAndParams(parameters, tokenAccount);
    }

    const associatedTokenAddress = await SPLToken.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenAccount.mint.address,
      parameters.destination,
    );

    const associatedTokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);

    const instructionsAndParams = makeTransferTokenInstructionAndParams(
      {
        source: parameters.source,
        destination: associatedTokenAddress,
        amount: parameters.amount,
      },
      tokenAccount,
    );

    if (associatedTokenAccountInfo && associatedTokenAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      return instructionsAndParams;
    }

    const { instructions, params, path } = instructionsAndParams;

    instructions.unshift(
      SPLToken.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenAccount.mint.address,
        associatedTokenAddress,
        parameters.destination,
        feePayer,
      ),
    );

    return {
      instructions,
      params: { ...params, recipient_pubkey: parameters.destination.toBase58() },
      path,
    };
  };

  const transfer = async (
    parameters: TransferParameters,
    tokenAccount: TokenAccount,
  ): Promise<string> => {
    if (!feeRelayerUrl) {
      throw new Error('feeRelayerUrl must be set');
    }

    const isTransferSol = parameters.source.equals(getWallet().pubkey);

    const feePayer = await getFeePayerPubkey();

    const { instructions, params, path } = isTransferSol
      ? makeTransferSolInstructionAndParams(parameters)
      : await getTransferTokenInstructionAndParams(parameters, tokenAccount, feePayer);

    const { signature, blockhash } = await makeTransaction(feePayer, instructions, []);

    return sendTransaction(path, {
      blockhash,
      signature,
      ...params,
    });
  };

  // const makeSwapInstructionsAndParams = async (
  //   parameters: SwapParameters & { feeCompensationPool: Pool },
  //   feePayer: PublicKey,
  // ): Promise<InstructionsAndParams> => {
  //   const { fromAccount, fromAmount, pool, slippage, feeCompensationPool } = parameters;
  //   const instructions = [];
  //   const signers: Account[] = [];
  //   let feeAmount = 0;
  //
  //   const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
  //     AccountLayout.span,
  //   );
  //
  //   const {
  //     feeCalculator: { lamportsPerSignature },
  //   } = await connection.getRecentBlockhash();
  //
  //   // const userTransferAuthority = new Account();
  //   const userTransferAuthorityPubkey = getWallet().pubkey; // userTransferAuthority.publicKey;
  //   // signers.push(userTransferAuthority);
  //
  //   feeAmount = lamportsPerSignature + lamportsPerSignature; // fee relayer + userTransferAuthority
  //
  //   const isReverse = isReverseSwap(parameters);
  //   const toToken = isReverse ? parameters.pool.tokenA.mint : parameters.pool.tokenB.mint;
  //   const toAccount = parameters.toAccount?.address;
  //   let userDestination = toAccount;
  //
  //   if (!parameters.toAccount) {
  //     const associatedTokenAddress = await SPLToken.getAssociatedTokenAddress(
  //       ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  //       TOKEN_PROGRAM_ID,
  //       toToken.address,
  //       getWallet().pubkey,
  //     );
  //
  //     instructions.push(
  //       SPLToken.createAssociatedTokenAccountInstruction(
  //         ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  //         TOKEN_PROGRAM_ID,
  //         toToken.address,
  //         associatedTokenAddress,
  //         getWallet().pubkey,
  //         feePayer,
  //       ),
  //     );
  //
  //     userDestination = associatedTokenAddress;
  //     feeAmount += accountRentExempt;
  //   }
  //
  //   const poolIntoAccount = isReverse ? pool.tokenB : pool.tokenA;
  //   const poolFromAccount = isReverse ? pool.tokenA : pool.tokenB;
  //
  //   const minimumToAmountWithoutSlippage = parameters.pool.calculateAmountInOtherToken(
  //     fromAccount.mint,
  //     fromAmount,
  //     true,
  //   );
  //
  //   const minimumToAmountWithSlippage = adjustForSlippage(
  //     minimumToAmountWithoutSlippage,
  //     'down',
  //     slippage,
  //   )
  //     .floor()
  //     .toNumber();
  //
  //   instructions.push(
  //     TokenSwap.swapInstruction(
  //       pool.address,
  //       pool.tokenSwapAuthority(),
  //       userTransferAuthorityPubkey,
  //       fromAccount.address,
  //       poolIntoAccount.address,
  //       poolFromAccount.address,
  //       userDestination || getWallet().pubkey,
  //       pool.poolToken.address,
  //       pool.feeAccount.address,
  //       null,
  //       swapProgramId,
  //       TOKEN_PROGRAM_ID,
  //       parameters.fromAmount,
  //       minimumToAmountWithSlippage,
  //     ),
  //   );
  //
  //   // fee_compensation_swap
  //   const feePayerWsolAccount = new Account();
  //   feeAmount += lamportsPerSignature;
  //
  //   const isReverseFeeCompensation = feeCompensationPool.tokenB.mint.equals(
  //     new Token(WRAPPED_SOL_MINT, 9, 0),
  //   );
  //   const feeCompensationPoolIntoAccount = isReverseFeeCompensation
  //     ? feeCompensationPool.tokenB
  //     : feeCompensationPool.tokenA;
  //   const feeCompensationPoolFromAccount = isReverseFeeCompensation
  //     ? feeCompensationPool.tokenA
  //     : feeCompensationPool.tokenB;
  //
  //   const feeCompensationAmountIn = feeCompensationPool.calculateAmountInOtherToken(
  //     feeCompensationPoolIntoAccount.mint,
  //     feeAmount,
  //     true,
  //   );
  //
  //   const feeMinimumToAmountWithSlippage = adjustForSlippage(feeCompensationAmountIn, 'up', 1)
  //     .floor()
  //     .toNumber();
  //
  //   instructions.push(
  //     SystemProgram.createAccount({
  //       fromPubkey: feePayer,
  //       newAccountPubkey: feePayerWsolAccount.publicKey,
  //       lamports: accountRentExempt,
  //       space: AccountLayout.span,
  //       programId: TOKEN_PROGRAM_ID,
  //     }),
  //   );
  //
  //   instructions.push(
  //     SPLToken.createInitAccountInstruction(
  //       TOKEN_PROGRAM_ID,
  //       WRAPPED_SOL_MINT,
  //       feePayerWsolAccount.publicKey,
  //       feePayer,
  //     ),
  //   );
  //
  //   instructions.push(
  //     TokenSwap.swapInstruction(
  //       feeCompensationPool.address,
  //       feeCompensationPool.tokenSwapAuthority(),
  //       userTransferAuthorityPubkey,
  //       fromAccount.address,
  //       feeCompensationPoolFromAccount.address,
  //       feeCompensationPoolIntoAccount.address,
  //       feePayerWsolAccount.publicKey,
  //       feeCompensationPool.poolToken.address,
  //       feeCompensationPool.feeAccount.address,
  //       null,
  //       swapProgramId,
  //       TOKEN_PROGRAM_ID,
  //       feeMinimumToAmountWithSlippage,
  //       feeAmount,
  //     ),
  //   );
  //
  //   instructions.push(
  //     SPLToken.createCloseAccountInstruction(
  //       TOKEN_PROGRAM_ID,
  //       feePayerWsolAccount.publicKey,
  //       feePayer,
  //       feePayer,
  //       [],
  //     ),
  //   );
  //
  //   return {
  //     instructions,
  //     params: {
  //       user_source_token_account_pubkey: fromAccount.address.toBase58(),
  //       user_destination_pubkey: toAccount ? toAccount.toBase58() : getWallet().pubkey.toBase58(),
  //       source_token_mint_pubkey: fromAccount.mint.address.toBase58(),
  //       destination_token_mint_pubkey: toToken.address.toBase58(),
  //       user_authority_pubkey: userTransferAuthorityPubkey.toBase58(),
  //       user_swap: {
  //         account_pubkey: pool.address.toBase58(),
  //         authority_pubkey: pool.tokenSwapAuthority().toBase58(),
  //         transfer_authority_pubkey: userTransferAuthorityPubkey.toBase58(),
  //         source_pubkey: poolIntoAccount.address.toBase58(),
  //         destination_pubkey: poolFromAccount.address.toBase58(),
  //         pool_token_mint_pubkey: pool.poolToken.address.toBase58(),
  //         pool_fee_account_pubkey: pool.feeAccount.address.toBase58(),
  //         amount_in: fromAmount,
  //         minimum_amount_out: minimumToAmountWithSlippage,
  //       },
  //       fee_compensation_swap: {
  //         account_pubkey: feeCompensationPool.address.toBase58(),
  //         authority_pubkey: feeCompensationPool.tokenSwapAuthority().toBase58(),
  //         transfer_authority_pubkey: userTransferAuthorityPubkey.toBase58(),
  //         source_pubkey: feeCompensationPoolFromAccount.address.toBase58(),
  //         destination_pubkey: feeCompensationPoolIntoAccount.address.toBase58(),
  //         pool_token_mint_pubkey: feeCompensationPool.poolToken.address.toBase58(),
  //         pool_fee_account_pubkey: feeCompensationPool.feeAccount.address.toBase58(),
  //         amount_in: feeMinimumToAmountWithSlippage,
  //         minimum_amount_out: feeAmount,
  //       },
  //       fee_payer_wsol_account_keypair: bs58.encode(feePayerWsolAccount.secretKey),
  //     },
  //     path: '/swap_spl_token_with_fee_compensation',
  //     signers,
  //   };
  // };
  //
  // const swap = async (
  //   parameters: SwapParameters & { feeCompensationPool: Pool },
  // ): Promise<string> => {
  //   if (!feeRelayerUrl) {
  //     throw new Error('feeRelayerUrl must be set');
  //   }
  //
  //   validateSwapParameters(parameters);
  //
  //   const feePayer = await getFeePayerPubkey();
  //
  //   const { instructions, params, path, signers } = await makeSwapInstructionsAndParams(
  //     parameters,
  //     feePayer,
  //   );
  //
  //   const { signature, blockhash } = await makeTransaction(feePayer, instructions, signers || []);
  //
  //   return sendTransaction(path, {
  //     blockhash,
  //     signature,
  //     ...params,
  //   });
  // };

  return {
    transfer,
    // swap,
  };
});
