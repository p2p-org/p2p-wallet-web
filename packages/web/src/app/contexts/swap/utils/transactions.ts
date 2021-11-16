import { nowMS } from '@orca-so/sdk';
import type { Connection, SignatureResult, Transaction } from '@solana/web3.js';
import base58 from 'bs58';

const TIMEOUT_MS = 60_000;
const REFRESH_INTERVAL_MS = 1_000;

// getSignature extracts the transaction ID from a signed transaction.
// The transaction ID is simply the first signature in the transaction.
export function getSignature(signedTransaction: Transaction): string {
  if (!signedTransaction.signatures[0].signature) {
    throw Error('Unable to find signature for transaction');
  }

  return base58.encode(signedTransaction.signatures[0].signature);
}

async function getConfirmationFast(connection: Connection, txid: string): Promise<boolean> {
  try {
    const { value } = await connection.getSignatureStatus(txid);
    // Due to a bug (https://github.com/solana-labs/solana/issues/15461)
    // the `confirmationStatus` field could be unpopulated.
    // To handle this case, also check the `confirmations` field.
    // Note that a `null` value for `confirmations` signals that the
    // transaction was finalized.
    return (
      (typeof value?.confirmations === 'number' && value?.confirmations > 0) ||
      value?.confirmations === null ||
      value?.confirmationStatus === 'confirmed'
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getConfirmation(connection: Connection, txid: string): Promise<boolean> {
  try {
    const confirmViaSocket = new Promise<SignatureResult>((resolve) =>
      connection.onSignature(txid, (signatureResult) => {
        console.log('Confirmation via socket:', signatureResult);
        resolve(signatureResult);
      }),
    );

    const confirmViaHttp = connection.confirmTransaction(txid).then((signatureResult) => {
      console.log('Confirmation via http:', signatureResult);
      return signatureResult.value;
    });

    await Promise.race([confirmViaHttp, confirmViaSocket]);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function sendAndConfirmFast(
  connection: Connection,
  signedTransaction: Transaction,
): () => Promise<null> {
  return async () => {
    const rawTransaction = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction);

    const startTime = nowMS();
    while (true) {
      if (await getConfirmationFast(connection, txid)) {
        return null;
      }

      if (nowMS() - startTime > TIMEOUT_MS) {
        throw new Error(`Raw transaction ${txid} failed (${JSON.stringify(txid)})`);
      }

      await new Promise((resolve) => setTimeout(resolve, REFRESH_INTERVAL_MS));
    }
  };
}

export function sendAndConfirm(
  connection: Connection,
  signedTransaction: Transaction,
): () => Promise<null> {
  return async () => {
    const rawTransaction = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction);

    const startTime = nowMS();
    while (true) {
      if (await getConfirmation(connection, txid)) {
        return null;
      }

      if (nowMS() - startTime > TIMEOUT_MS) {
        throw new Error(`Raw transaction ${txid} failed (${JSON.stringify(txid)})`);
      }

      await new Promise((resolve) => setTimeout(resolve, REFRESH_INTERVAL_MS));
    }
  };
}
