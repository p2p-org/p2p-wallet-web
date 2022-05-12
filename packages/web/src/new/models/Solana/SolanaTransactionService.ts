/* eslint-disable no-console */
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import type {
  Blockhash,
  Commitment,
  FeeCalculator,
  Keypair,
  SignatureStatus,
  TransactionInstruction,
} from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
import { get } from 'lodash';
import { nanoid } from 'nanoid';
import { delay, inject, injectable } from 'tsyringe';

import { WalletModel } from '../WalletModel/WalletModel';
import { SolanaModel } from './SolanaModel';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

export const DEFAULT_TIMEOUT = 15000;

export type BlockType = {
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
};

@injectable()
export class SolanaTransactionService {
  context: string;

  constructor(
    @inject(delay(() => SolanaModel)) readonly solanaModel: Readonly<SolanaModel>,
    protected walletModel: WalletModel,
  ) {
    this.context = nanoid(10);
  }

  async getErrorForTransaction(txID: string): Promise<Array<string>> {
    const { connection } = this.solanaModel;
    // wait for all confirmation before geting transaction
    await connection.confirmTransaction(txID, 'max');

    const tx = await connection.getParsedConfirmedTransaction(txID);

    const errors = new Array<string>();
    if (tx?.meta && tx.meta.logMessages) {
      tx.meta.logMessages.forEach((log) => {
        const regex = /Error: (.*)/gm;
        let m;
        while ((m = regex.exec(log)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          if (m.length > 1) {
            errors.push(m[1]!);
          }
        }
      });
    }

    return errors;
  }

  async sendTransactionsWithManualRetry(
    instructions: Array<Array<TransactionInstruction>>,
    signers: Array<Array<Keypair>>,
  ): Promise<string[]> {
    let stopPoint = 0;
    let tries = 0;
    let lastInstructionsLength = null;
    const toRemoveSigners = new Array<boolean>();
    instructions = instructions.filter((instr, i) => {
      if (instr.length > 0) {
        return true;
      } else {
        toRemoveSigners[i] = true;
        return false;
      }
    });
    let ids = new Array<string>();
    let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);

    while (stopPoint < instructions.length && tries < 3) {
      instructions = instructions.slice(stopPoint, instructions.length);
      filteredSigners = filteredSigners.slice(stopPoint, filteredSigners.length);

      if (instructions.length === lastInstructionsLength) {
        tries = tries + 1;
      } else {
        tries = 0;
      }

      try {
        if (instructions.length === 1) {
          const id = await this.sendTransactionWithRetry(
            instructions[0]!,
            filteredSigners[0],
            'single',
          );
          ids.push(id.txid);
          stopPoint = 1;
        } else {
          const { txs } = await this.sendTransactions(
            instructions,
            filteredSigners,
            'StopOnFailure',
            'single',
          );
          ids = ids.concat(txs.map((t) => t.txid));
        }
      } catch (e) {
        console.error(e);
      }
      console.log(
        'Died on ',
        stopPoint,
        'retrying from instruction',
        instructions[stopPoint],
        'instructions length is',
        instructions.length,
      );
      lastInstructionsLength = instructions.length;
    }

    return ids;
  }

  async sendTransactions(
    instructionSet: Array<Array<TransactionInstruction>>,
    signersSet: Array<Array<Keypair>>,
    sequenceType = 'Parallel',
    commitment: Commitment = 'singleGossip',
    successCallback = (_txid: string, _ind: any) => {},
    failCallback = (_txid: string, _ind: any) => false,
    block?: {
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    },
  ): Promise<{ number: number; txs: Awaited<{ txid: string; slot: number }>[] }> {
    if (!this.walletModel.pubKey) {
      throw new Error('WalletNotConnectedError');
    }

    const walletAddress = this.walletModel.pubKey;

    const unsignedTxns = [];

    if (!block) {
      block = await this.solanaModel.connection.getRecentBlockhash(commitment);
    }

    for (let i = 0; i < instructionSet.length; i++) {
      const instructions = instructionSet[i]!;
      const signers = signersSet[i];

      if (instructions.length === 0) {
        continue;
      }

      const transaction = new Transaction({ feePayer: walletAddress });
      instructions.forEach((instruction) => transaction.add(instruction));
      transaction.recentBlockhash = block.blockhash;
      // transaction.setSigners(
      //     // fee payed by the wallet owner
      //     walletAddress,
      //     ...(signers.map((s:Keypair) => s.publicKey)),
      // );

      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }

      unsignedTxns.push(transaction);
    }

    const signedTxns = await this.walletModel.signAllTransactions(unsignedTxns);

    const pendingTxns = [];

    const breakEarlyObject = { breakEarly: false, i: 0 };
    console.log(
      'Signed txns length',
      signedTxns.length,
      'vs handed in length',
      instructionSet.length,
    );
    for (let i = 0; i < signedTxns.length; i++) {
      const signedTxnPromise = this.sendSignedTransaction(signedTxns[i]);

      signedTxnPromise
        .then(({ txid, slot }) => {
          successCallback(txid, i);
        })
        .catch((reason) => {
          failCallback(signedTxns[i].signature?.toString() ?? signedTxns[i].toString(), i);
          if (sequenceType === 'StopOnFailure') {
            breakEarlyObject.breakEarly = true;
            breakEarlyObject.i = i;
          }
        });

      if (sequenceType !== 'Parallel') {
        try {
          await signedTxnPromise;
        } catch (e) {
          console.log('Caught failure', e);
          if (breakEarlyObject.breakEarly) {
            console.log('Died on ', breakEarlyObject.i);
            // Return the txn we failed on by index
            return {
              number: breakEarlyObject.i,
              txs: await Promise.all(pendingTxns),
            };
          }
        }
      } else {
        pendingTxns.push(signedTxnPromise);
      }
    }

    if (sequenceType !== 'Parallel') {
      await Promise.all(pendingTxns);
    }

    return { number: signedTxns.length, txs: await Promise.all(pendingTxns) };
  }

  async sendSignedTransaction(
    signedTransaction: Transaction,
    timeout = DEFAULT_TIMEOUT,
  ): Promise<{ txid: string; slot: number }> {
    const rawTransaction = signedTransaction.serialize();
    const startTime = getUnixTs();
    let slot = 0;
    const txid = await this.solanaModel.connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    });

    console.log('Started awaiting confirmation for', txid);

    let done = false;
    (async () => {
      while (!done && getUnixTs() - startTime < timeout) {
        this.solanaModel.connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        });
        await sleep(500);
      }
    })().then(() => console.log('~~~ done with transaction await'));
    try {
      const confirmation = await this.awaitTransactionSignatureConfirmation(
        txid,
        timeout,
        'recent',
        true,
      );

      if (!confirmation) {
        throw new Error('Timed out awaiting confirmation on transaction');
      }

      if (confirmation.err) {
        console.error(confirmation.err);
        throw new Error('Transaction failed: Custom instruction error');
      }

      slot = confirmation?.slot || 0;
    } catch (err) {
      console.error('Timeout Error caught', err);
      if (get(err, 'timeout')) {
        throw new Error('Timed out awaiting confirmation on transaction');
      }
      let simulateResult = null;
      try {
        simulateResult = (await this.simulateTransaction(signedTransaction, 'single')).value;
      } catch (e) {}
      if (simulateResult && simulateResult.err) {
        if (simulateResult.logs) {
          for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
            const line = simulateResult.logs[i];
            if (line.startsWith('Program log: ')) {
              throw new Error('Transaction failed: ' + line.slice('Program log: '.length));
            }
          }
        }
        throw new Error(JSON.stringify(simulateResult.err));
      }
      // throw new Error('Transaction failed');
    } finally {
      done = true;
    }

    console.log('Latency', txid, getUnixTs() - startTime);
    return { txid, slot };
  }

  async sendTransaction(
    instructions: Array<TransactionInstruction>,
    signers: Array<Keypair>,
    awaitConfirmation = true,
    commitment: Commitment = 'singleGossip',
    includesFeePayer = false,
    successCallback = (_txid: string, _ind: any) => {},
    failCallback = (_txid: string, _ind: any) => false,
    block?: {
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    },
  ): Promise<{ txid: string; slot: number }> {
    if (!this.walletModel.publicKey) {
      throw new WalletNotConnectedError();
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = (
      block || (await this.solanaModel.connection.getRecentBlockhash(commitment))
    ).blockhash;

    if (includesFeePayer) {
      transaction.setSigners(...signers.map((s) => s.publicKey));
    } else {
      transaction.setSigners(
        // fee payed by the wallet owner
        this.walletModel.pubKey,
        ...signers.map((s) => s.publicKey),
      );
    }

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    if (!includesFeePayer) {
      transaction = await this.walletModel.signTransaction(transaction);
    }

    const rawTransaction = transaction.serialize();
    const options = {
      skipPreflight: true,
      commitment,
    };

    const txid = await this.solanaModel.connection.sendRawTransaction(rawTransaction, options);
    let slot = 0;

    if (awaitConfirmation) {
      const confirmation = await this.awaitTransactionSignatureConfirmation(
        txid,
        DEFAULT_TIMEOUT,
        commitment,
      );

      if (!confirmation) {
        throw new Error('Timed out awaiting confirmation on transaction');
      }
      slot = confirmation?.slot || 0;

      if (confirmation?.err) {
        const errors = await this.getErrorForTransaction(txid);

        console.log(errors);
        throw new Error(`Raw transaction ${txid} failed`);
      }
    }

    return { txid, slot };
  }

  async sendTransactionWithRetry(
    instructions: Array<TransactionInstruction>,
    signers: Array<Keypair>,
    commitment: Commitment = 'singleGossip',
    includesFeePayer = false,
    beforeSend?: () => void | null,
    block?: BlockType | null,
  ): Promise<{ txid: string; slot: number }> {
    if (!this.walletModel.publicKey) {
      throw new WalletNotConnectedError();
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = (
      block || (await this.solanaModel.connection.getRecentBlockhash(commitment))
    ).blockhash;

    if (includesFeePayer) {
      transaction.setSigners(...signers.map((s) => s.publicKey));
    } else {
      transaction.setSigners(
        // fee payed by the wallet owner
        this.walletModel.pubKey,
        ...signers.map((s) => s.publicKey),
      );
    }

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
    if (!includesFeePayer) {
      transaction = await this.walletModel.signTransaction(transaction);
    }

    if (beforeSend) {
      beforeSend();
    }

    const { txid, slot } = await this.sendSignedTransaction(transaction);

    return { txid, slot };
  }

  async simulateTransaction(transaction: Transaction, commitment: Commitment): Promise<any> {
    // @ts-ignore
    transaction.recentBlockhash = await this.solanaModel.connection._blockhashWithExpiryBlockHeight(
      // @ts-ignore
      connection._disableBlockhashCaching,
    );

    const signData = transaction.serializeMessage();
    // @ts-ignore
    const wireTransaction = transaction._serialize(signData);
    const encodedTransaction = wireTransaction.toString('base64');
    const config = { encoding: 'base64', commitment };
    const args = [encodedTransaction, config];

    // @ts-ignore
    const res = await this.solanaModel.connection._rpcRequest('simulateTransaction', args);
    if (res.error) {
      throw new Error('failed to simulate transaction: ' + res.error.message);
    }
    return res.result;
  }

  async awaitTransactionSignatureConfirmation(
    txID: string,
    timeout: number,
    commitment = 'recent',
    queryStatus = false,
  ): Promise<SignatureStatus | null> {
    let done = false;
    let status: SignatureStatus | null = {
      slot: 0,
      confirmations: 0,
      err: null,
    };
    let subId = 0;
    status = await new Promise(async (resolve, reject) => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.log('Rejecting for timeout...');
        reject({ timeout: true });
      }, timeout);
      try {
        subId = this.solanaModel.connection.onSignature(
          txID,
          (result, context) => {
            done = true;
            if (result.err) {
              console.log('Rejected via websocket', result.err);
              reject({ err: result.err });
            } else {
              status = {
                err: null,
                slot: context.slot,
                confirmations: 0,
              };
              console.log('Resolved via websocket', result);
              resolve(status);
            }
          },
          commitment as Commitment,
        );
      } catch (e) {
        done = true;
        console.error('WS error in setup', txID, e);
      }
      while (!done && queryStatus) {
        // eslint-disable-next-line no-loop-func
        await (async () => {
          try {
            const signatureStatuses = await this.solanaModel.connection.getSignatureStatuses([
              txID,
            ]);
            status = signatureStatuses && signatureStatuses.value[0];
            if (!done) {
              if (!status) {
                console.log('REST null result for', txID, status);
              } else if (status.err) {
                console.log('REST error for', txID, status);
                done = true;
                reject(status.err);
              } else if (!status.confirmations) {
                console.log('REST no confirmations for', txID, status);
              } else {
                console.log('REST confirmation for', txID, status);
                done = true;
                resolve(status);
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: txid', txID, e);
            }
          }
        })();
        await sleep(2000);
      }
    });

    //@ts-ignore
    if (this.solanaModel.connection._signatureSubscriptions[subId]) {
      this.solanaModel.connection
        .removeSignatureListener(subId)
        .then(() => console.log('~~ removed listener'));
    }
    done = true;
    console.log('Returning status', status);
    return status;
  }
}
