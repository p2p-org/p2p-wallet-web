import { instanceToPlain, plainToInstance } from 'class-transformer';
import { singleton } from 'tsyringe';

import type { IncomingTransaction, SessionJSONType } from '../../actions/LockAndMint';
import { ProcessingTx, Session, ValidationStatus } from '../../actions/LockAndMint';

const keyForSession = 'renVMSession';
const keyForGatewayAddress = 'renVMGatewayAddress';
const keyForProcessingTransactions = 'renVMProcessingTxs';

@singleton()
export class LockAndMintServicePersistentStore {
  get session(): Session {
    const data = localStorage.getItem(keyForSession);

    if (!data) {
      return Session.default;
    }

    return Session.fromJSON(JSON.parse(data) as SessionJSONType);
  }

  saveSession(session: Session): void {
    localStorage.setItem(keyForSession, JSON.stringify(session));
  }

  get gatewayAddress(): string | null {
    return localStorage.getItem(keyForGatewayAddress);
  }

  saveGatewayAddress(gatewayAddres: string): void {
    localStorage.setItem(keyForGatewayAddress, gatewayAddres);
  }

  get processingTransactions(): ProcessingTx[] {
    const data = localStorage.getItem(keyForProcessingTransactions);

    if (!data) {
      return [];
    }

    return plainToInstance(ProcessingTx, JSON.parse(data));
  }

  saveProcessingTransactions(txs: ProcessingTx[]): void {
    localStorage.setItem(keyForProcessingTransactions, JSON.stringify(instanceToPlain(txs)));
  }

  markAsProcessing(transaction: ProcessingTx): void {
    this._save((current) => {
      const curTx = current.find((tx) => tx.tx.txid === transaction.tx.txid);
      if (!curTx) {
        return false;
      }
      curTx.isProcessing = true;
      return true;
    });
  }

  markAllTransactionsAsNotProcessing(): void {
    this._save((current) => {
      for (const tx of current) {
        tx.isProcessing = false;
      }
      return true;
    });
  }

  markAsReceived(tx: IncomingTransaction, date: number): void {
    this._save((current) => {
      const curTx = current.find((_tx) => _tx.tx.txid === tx.txid);
      if (!curTx) {
        current.push(new ProcessingTx({ tx, receivedAt: date }));
        return true;
      }

      if (tx.vout === 3 && !curTx.threeVoteAt) {
        curTx.threeVoteAt = date;
      }
      if (tx.vout === 2 && !curTx.twoVoteAt) {
        curTx.twoVoteAt = date;
      }
      if (tx.vout === 1 && !curTx.oneVoteAt) {
        curTx.oneVoteAt = date;
      }
      if (tx.vout === 0 && !curTx.receivedAt) {
        curTx.receivedAt = date;
      }

      return true;
    });
  }

  markAsConfirmed(tx: IncomingTransaction, date: number): void {
    this._save((current) => {
      const curTx = current.find((_tx) => _tx.tx.txid === tx.txid);
      if (!curTx) {
        current.push(new ProcessingTx({ tx, confirmedAt: date }));
        return true;
      }
      curTx.confirmedAt = date;
      return true;
    });
  }

  markAsSubmitted(tx: IncomingTransaction, date: number): void {
    this._save((current) => {
      const curTx = current.find((_tx) => _tx.tx.txid === tx.txid);
      if (!curTx) {
        current.push(new ProcessingTx({ tx, submittedAt: date }));
        return true;
      }
      curTx.submittedAt = date;
      return true;
    });
  }

  markAsMinted(tx: IncomingTransaction, date: number): void {
    this._save((current) => {
      const curTx = current.find((_tx) => _tx.tx.txid === tx.txid);
      if (!curTx) {
        current.push(new ProcessingTx({ tx, mintedAt: date }));
        return true;
      }
      curTx.mintedAt = date;
      return true;
    });
  }

  markAsInvalid(txid: string, reason: string): void {
    this._save((current) => {
      const curTx = current.find((_tx) => _tx.tx.txid === txid);
      if (!curTx) {
        return false;
      }
      curTx.validationStatus = ValidationStatus.invalid(reason);
      return true;
    });
  }

  private _save(modify: (current: ProcessingTx[]) => boolean): void {
    const txs = this.processingTransactions || [];
    const shouldSave = modify(txs);
    if (shouldSave) {
      this.saveProcessingTransactions(txs);
    }
  }

  clearAll(): void {
    localStorage.removeItem(keyForSession);
    localStorage.removeItem(keyForGatewayAddress);
    localStorage.removeItem(keyForProcessingTransactions);
  }
}
