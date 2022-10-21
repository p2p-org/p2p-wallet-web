import { instanceToPlain, plainToInstance } from 'class-transformer';

import { LogEvent, Logger } from 'new/sdk/SolanaSDK';

import type { IncomingTransaction, SessionJSONType } from '../../actions/LockAndMint';
import { ProcessingTx, Session, ValidationStatus } from '../../actions/LockAndMint';

export const keyForSession = 'renVMSession';
export const keyForGatewayAddress = 'renVMGatewayAddress';
export const keyForProcessingTransactions = 'renVMProcessingTxs';

// PersistentStore to persist current works
interface LockAndMintServicePersistentStoreType {
  // Session
  // Current working Session
  readonly session: Session | null;

  // Save session
  saveSession(session: Session): void;

  // GatewayAddress
  // CurrentGatewayAddress
  readonly gatewayAddress: string | null;

  // Save gateway address
  saveGatewayAddress(gatewayAddress: string): void;

  // ProcessingTransaction
  /// Transaction which are being processed
  readonly processingTransactions: ProcessingTx[];

  /// Mark as processing
  markAsProcessing(transaction: ProcessingTx): void;

  /// Mark all transaction as not processing
  markAllTransactionsAsNotProcessing(): void;

  /// Mark as received
  markAsReceived(incomingTransaction: IncomingTransaction, date: Date): void;

  /// Mark as confimed
  markAsConfirmed(incomingTransaction: IncomingTransaction, date: Date): void;

  /// Mark as submited
  markAsSubmitted(incomingTransaction: IncomingTransaction, date: Date): void;

  /// Mark as minted
  markAsMinted(incomingTransaction: IncomingTransaction, date: Date): void;

  /// Mark as invalid
  markAsInvalid(txid: string, reason?: string): void;

  // Clearance
  /// Clear all (expire current session)
  clearAll(): void;
}

// Implementation of LockAndMintServicePersistentStore, using UserDefaults as storage
export class LockAndMintServicePersistentStore implements LockAndMintServicePersistentStoreType {
  // Key to store session in UserDefaults
  private _userDefaultKeyForSession: string;
  // Key to store gateway address in UserDefaults
  private _userDefaultKeyForGatewayAddress: string;
  // Key to store processingTransactions in UserDefaults
  private _userDefaultKeyForProcessingTransactions: string;

  // Flag to indicate whether show log or not
  private _showLog: boolean;

  constructor({
    userDefaultKeyForSession,
    userDefaultKeyForGatewayAddress,
    userDefaultKeyForProcessingTransactions,
    showLog,
  }: {
    userDefaultKeyForSession: string;
    userDefaultKeyForGatewayAddress: string;
    userDefaultKeyForProcessingTransactions: string;
    showLog: boolean;
  }) {
    this._userDefaultKeyForSession = userDefaultKeyForSession;
    this._userDefaultKeyForGatewayAddress = userDefaultKeyForGatewayAddress;
    this._userDefaultKeyForProcessingTransactions = userDefaultKeyForProcessingTransactions;
    this._showLog = showLog;
  }

  // Session

  get session(): Session | null {
    const data = this._getFromUserDefault<SessionJSONType | null>(this._userDefaultKeyForSession);
    return data ? Session.fromJSON(data) : null;
  }
  saveSession(session: Session): void {
    this._saveToUserDefault(session, this._userDefaultKeyForSession);
  }

  // Gateway address

  get gatewayAddress(): string | null {
    return this._getFromUserDefault(this._userDefaultKeyForGatewayAddress);
  }
  saveGatewayAddress(gatewayAddress: string): void {
    this._saveToUserDefault(gatewayAddress, this._userDefaultKeyForGatewayAddress);
  }

  // Processing transactions

  get processingTransactions(): ProcessingTx[] {
    const data = this._getFromUserDefault<any | null>(
      this._userDefaultKeyForProcessingTransactions,
    );
    return data ? plainToInstance(ProcessingTx, data) : [];
  }
  saveProcessingTransactions(txs: ProcessingTx[]): void {
    this._saveToUserDefault(instanceToPlain(txs), this._userDefaultKeyForProcessingTransactions);
  }

  markAsProcessing(transaction: ProcessingTx): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === transaction.tx.txid);
      if (index === -1) {
        return false;
      }
      current[index]!.isProcessing = true;
      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Transaction with id ${
          transaction.tx.txid
        }, vout: ${transaction.tx.vout.toString()}, isConfirmed: ${
          transaction.tx.status.confirmed
        }, value: ${transaction.tx.value.toString()} is being processed`,
        LogEvent.request,
      );
    }
  }

  markAllTransactionsAsNotProcessing(): void {
    this._save((current) => {
      for (const tx of current) {
        tx.isProcessing = false;
      }
      return true;
    });

    if (this._showLog) {
      Logger.log('All transactions has been removed from queue', LogEvent.info);
    }
  }

  markAsReceived(tx: IncomingTransaction, date: Date): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === tx.txid);
      if (index === -1) {
        current.push(new ProcessingTx({ tx, receivedAt: date }));
        return true;
      }

      if (tx.vout.eqn(3) && !current[index]!.threeVoteAt) {
        current[index]!.threeVoteAt = date;
      }
      if (tx.vout.eqn(2) && !current[index]!.twoVoteAt) {
        current[index]!.twoVoteAt = date;
      }
      if (tx.vout.eqn(1) && !current[index]!.oneVoteAt) {
        current[index]!.oneVoteAt = date;
      }
      if (tx.vout.eqn(0) && !current[index]!.receivedAt) {
        current[index]!.receivedAt = date;
      }

      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Received transaction with id ${tx.txid}, vout: ${tx.vout.toString()}, isConfirmed: ${
          tx.status.confirmed
        }, value: ${tx.value.toString()}`,
        LogEvent.event,
      );
    }
  }

  markAsConfirmed(tx: IncomingTransaction, date: Date): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === tx.txid);
      if (index === -1) {
        current.push(new ProcessingTx({ tx, confirmedAt: date }));
        return true;
      }
      current[index]!.confirmedAt = date;
      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Transaction with id ${
          tx.txid
        } has been confirmed, vout: ${tx.vout.toString()}, value: ${tx.value.toString()}`,
        LogEvent.event,
      );
    }
  }

  markAsSubmitted(tx: IncomingTransaction, date: Date): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === tx.txid);
      if (index === -1) {
        current.push(new ProcessingTx({ tx, submittedAt: date }));
        return true;
      }
      current[index]!.submittedAt = date;
      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Transaction with id ${tx.txid} has been submited, value: ${tx.value.toString()}`,
        LogEvent.event,
      );
    }
  }

  markAsMinted(tx: IncomingTransaction, date: Date): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === tx.txid);
      if (index === -1) {
        current.push(new ProcessingTx({ tx, mintedAt: date }));
        return true;
      }
      current[index]!.mintedAt = date;
      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Transaction with id ${tx.txid} has been minted, value: ${tx.value.toString()}`,
        LogEvent.event,
      );
    }
  }

  markAsInvalid(txid: string, reason?: string): void {
    this._save((current) => {
      const index = current.findIndex((_tx) => _tx.tx.txid === txid);
      if (index === -1) {
        return false;
      }
      current[index]!.validationStatus = ValidationStatus.invalid(reason);
      return true;
    });

    if (this._showLog) {
      Logger.log(
        `Transaction with id ${txid} is invalid, reason: ${reason ?? 'null'}`,
        LogEvent.event,
      );
    }
  }

  clearAll(): void {
    this._clearFromUserDefault(this._userDefaultKeyForSession);
    this._clearFromUserDefault(this._userDefaultKeyForGatewayAddress);
    this._clearFromUserDefault(this._userDefaultKeyForProcessingTransactions);
  }

  // Private

  private _getFromUserDefault<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      const session: T = JSON.parse(data!);
      if (!data || !session) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private _saveToUserDefault<T>(value: T, key: string): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private _clearFromUserDefault(key: string): void {
    localStorage.removeItem(key);
  }

  private _save(modify: (current: ProcessingTx[]) => boolean): void {
    const current: ProcessingTx[] = this.processingTransactions || [];
    const shouldSave = modify(current);
    if (shouldSave) {
      this.saveProcessingTransactions(current);
    }
  }
}
