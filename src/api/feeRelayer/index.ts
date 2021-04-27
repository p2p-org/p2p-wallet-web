import { Token as SPLToken } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { identity, memoizeWith } from 'ramda';

import { getConnection } from 'api/connection';
import { TOKEN_PROGRAM_ID, TransferParameters } from 'api/token';
import { TokenAccount } from 'api/token/TokenAccount';
import { getWallet } from 'api/wallet';
import { feeRelayerUrl } from 'config/constants';
import { ExtendedCluster } from 'utils/types';

type SignaturePubkeyPair = {
  signature: Buffer | null;
  publicKey: PublicKey;
};

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
  transfer: (parameters: TransferParameters, tokenAccount?: TokenAccount) => Promise<string>;
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

    const makeTransaction = async (
      feePayer: PublicKey,
      instructions: (TransactionInstruction | TransactionInstructionCtorFields)[],
    ) => {
      const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

      const transaction = new Transaction({
        recentBlockhash,
        feePayer,
      });
      transaction.add(...instructions);

      const signedTransacton = await getWallet().sign(transaction);

      const { signature } = signedTransacton.signatures.find((sign: SignaturePubkeyPair) =>
        sign.publicKey.equals(getWallet().pubkey),
      );

      return {
        blockhash: recentBlockhash,
        signature: bs58.encode(signature),
      };
    };

    const transfer = async (
      parameters: TransferParameters,
      tokenAccount?: TokenAccount,
    ): Promise<string> => {
      if (!feeRelayerUrl) {
        throw new Error('feeRelayerUrl must be set');
      }

      const isTransferSol = parameters.source.equals(getWallet().pubkey);

      const transferInstruction = isTransferSol
        ? SystemProgram.transfer({
            fromPubkey: parameters.source,
            toPubkey: parameters.destination,
            lamports: parameters.amount,
          })
        : SPLToken.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            parameters.source,
            parameters.destination,
            getWallet().pubkey,
            [],
            parameters.amount,
          );

      const feePayer = await getFeePayerPubkey();

      const { signature, blockhash } = await makeTransaction(new PublicKey(feePayer), [
        transferInstruction,
      ]);

      const transferParams = isTransferSol
        ? {
            blockhash,
            signature,
            sender_pubkey: parameters.source.toBase58(),
            lamports: parameters.amount,
            recipient_pubkey: parameters.destination.toBase58(),
          }
        : {
            sender_token_account_pubkey: parameters.source.toBase58(),
            recipient_pubkey: parameters.destination.toBase58(),
            token_mint_pubkey: tokenAccount?.mint.address.toBase58(),
            authority_pubkey: tokenAccount?.owner.toBase58(),
            amount: parameters.amount,
            decimals: tokenAccount?.mint.decimals || 6,
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
