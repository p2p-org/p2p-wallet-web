import { Token as SPLToken } from '@solana/spl-token';
import {
  PublicKey,
  SignaturePubkeyPair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { identity, memoizeWith } from 'ramda';

import { getConnection } from 'api/connection';
import { TOKEN_PROGRAM_ID, TransferParameters } from 'api/token';
import { TokenAccount } from 'api/token/TokenAccount';
import { getWallet } from 'api/wallet';
import { feeRelayerUrl } from 'config/constants';
import { ExtendedCluster } from 'utils/types';

type TransferSolParams = {
  sender_pubkey: string;
  recipient_pubkey: string;
  lamports: number;
  signature: string;
  blockhash: string;
};

type TransferSPLTokenParams = {
  sender_token_account_pubkey: string;
  recipient_pubkey: string;
  token_mint_pubkey: string;
  authority_pubkey: string;
  amount: number;
  decimals: number;
  signature: string;
  blockhash: string;
};

export interface API {
  transfer: (parameters: TransferParameters, tokenAccount: TokenAccount) => Promise<string>;
}

const getFeePayerPubkey = async (): Promise<string> => {
  try {
    const res = await fetch(`${feeRelayerUrl}/fee_payer/pubkey`);

    if (!res.ok) {
      throw new Error('getFeePayerPubkey something wrong');
    }

    const result = await res.text();

    return result;
  } catch (error) {
    throw new Error(`Can't get fee payer pubkey: ${error}`);
  }
};

const sendTransaction = async (
  path: string,
  params: TransferSolParams | TransferSPLTokenParams,
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

export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const connection = getConnection(cluster);

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
        signature: bs58.encode(signaturePubkeyPair?.signature),
      };
    };

    const transfer = async (
      parameters: TransferParameters,
      tokenAccount: TokenAccount,
    ): Promise<string> => {
      if (!feeRelayerUrl) {
        throw new Error('feeRelayerUrl must be set');
      }

      const { source, destination, amount } = parameters;

      const isTransferSol = source.equals(getWallet().pubkey);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const transferInstruction = isTransferSol
        ? SystemProgram.transfer({
            fromPubkey: source,
            toPubkey: destination,
            lamports: amount,
          })
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          SPLToken.createTransferCheckedInstruction(
            TOKEN_PROGRAM_ID,
            source,
            tokenAccount.mint.address,
            destination,
            tokenAccount.owner,
            [],
            amount,
            tokenAccount.mint.decimals,
          );

      const feePayer = await getFeePayerPubkey();

      const { signature, blockhash } = await makeTransaction(new PublicKey(feePayer), [
        transferInstruction,
      ]);

      const transferParams = isTransferSol
        ? {
            blockhash,
            signature,
            sender_pubkey: source.toBase58(),
            lamports: amount,
            recipient_pubkey: destination.toBase58(),
          }
        : {
            sender_token_account_pubkey: source.toBase58(),
            recipient_pubkey: destination.toBase58(),
            token_mint_pubkey: tokenAccount.mint.address.toBase58(),
            authority_pubkey: tokenAccount.owner.toBase58(),
            amount,
            decimals: tokenAccount.mint.decimals,
            signature,
            blockhash,
          };

      return sendTransaction(
        isTransferSol ? '/transfer_sol' : '/transfer_spl_token',
        transferParams,
      );
    };

    return {
      transfer,
    };
  },
);
