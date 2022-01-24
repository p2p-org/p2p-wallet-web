import type { Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

import type { RelaySignatures, RelayTransaction, RequestInstruction } from './types';

const findIndex = (arr: string[], key: string): number => arr.findIndex((k) => k === key);

export const serializeToRelayTransaction = (signedTransaction: Transaction): RelayTransaction => {
  const { instructions, signatures } = signedTransaction;

  const message = signedTransaction.compileMessage();
  const pubkeys = message.accountKeys.map((acc) => acc.toBase58());

  const requestInstructions = [] as RequestInstruction[];

  for (const instruction of instructions) {
    const accounts = [];
    for (const key of instruction.keys) {
      accounts.push({
        pubkey: findIndex(pubkeys, key.pubkey.toBase58()),
        is_signer: key.isSigner,
        is_writable: key.isWritable,
      });
    }

    requestInstructions.push({
      program_id: findIndex(pubkeys, instruction.programId.toBase58()),
      accounts,
      data: [...instruction.data.values()],
    });
  }

  const relayTransactionSignatures = {} as RelaySignatures;
  for (const sign of signatures) {
    if (!sign.signature) {
      continue;
    }

    relayTransactionSignatures[findIndex(pubkeys, sign.publicKey.toBase58())] = bs58.encode(
      sign.signature,
    );
  }

  return {
    instructions: requestInstructions,
    signatures: relayTransactionSignatures,
    pubkeys,
    blockhash: message.recentBlockhash,
  };
};
