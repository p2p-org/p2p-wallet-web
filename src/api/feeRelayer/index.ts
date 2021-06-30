import { Token as SPLToken } from '@solana/spl-token';
import {
  PublicKey,
  SignaturePubkeyPair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { memoizeWith, toString } from 'ramda';

import { getConnection } from 'api/connection';
import {
  ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TransferParameters,
} from 'api/token';
import { TokenAccount } from 'api/token/TokenAccount';
import { getWallet } from 'api/wallet';
import { feeRelayerUrl, NetworkType } from 'config/constants';

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

type InstructionsAndParams = {
  instructions: TransactionInstruction[];
  transferParams: TransferSolParams | TransferSPLTokenParams;
  path: string;
};

export interface API {
  transfer: (parameters: TransferParameters, tokenAccount: TokenAccount) => Promise<string>;
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
  params: (TransferSolParams | TransferSPLTokenParams) & {
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

    return result;
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
    transferParams: {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      SPLToken.createTransferCheckedInstruction(
        TOKEN_PROGRAM_ID,
        source,
        tokenAccount.mint.address,
        destination,
        tokenAccount.owner,
        [],
        amount,
        tokenAccount.mint.decimals,
      ) as TransactionInstruction,
    ],
    transferParams: {
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

export const APIFactory = memoizeWith(
  toString,
  (network: NetworkType): API => {
    const connection = getConnection(network);

    const makeTransaction = async (feePayer: PublicKey, instructions: TransactionInstruction[]) => {
      const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

      const transaction = new Transaction({
        recentBlockhash,
        feePayer,
      });
      transaction.add(...instructions);

      const signedTransacton = await getWallet().sign(transaction);

      const signaturePubkeyPair = signedTransacton.signatures.find((sign: SignaturePubkeyPair) =>
        sign.publicKey.equals(getWallet().pubkey),
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

      const { instructions, transferParams, path } = instructionsAndParams;

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

      transferParams.recipient_pubkey = parameters.destination.toBase58();

      return { instructions, transferParams, path };
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

      const { instructions, transferParams, path } = isTransferSol
        ? makeTransferSolInstructionAndParams(parameters)
        : await getTransferTokenInstructionAndParams(parameters, tokenAccount, feePayer);

      const { signature, blockhash } = await makeTransaction(feePayer, instructions);

      return sendTransaction(path, {
        blockhash,
        signature,
        ...transferParams,
      });
    };

    return {
      transfer,
    };
  },
);
