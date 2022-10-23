import type { u64 } from '@solana/spl-token';
import {
  buildCancellablePromise,
  CancellablePromise,
  pseudoCancellable,
} from 'real-cancellable-promise';

import { LogEvent, Logger } from 'new/sdk/SolanaSDK';
import { cancellablePromiseRetry } from 'new/utils/promise/cancellablePromiseRetry';

import type { GatewayAddressResponse } from '../../../actions/LockAndMint';
import {
  LockAndMint,
  ProcessingTx,
  Session,
  ValidationStatusType,
} from '../../../actions/LockAndMint';
import type { RenVMChainType } from '../../../chains/RenVMChainType';
import { RenVMError } from '../../../models';
import type { RenVMRpcClientType } from '../../../RPCClient/RPCClient';
import type { ChainProvider } from '../../ChainProvider';
import type { LockAndMintService } from '../LockAndMintService';
import type { LockAndMintServiceDelegate } from '../LockAndMintServiceDelegate';
import type { LockAndMintServicePersistentStore } from '../LockAndMintServicePersistentStore';
import type { MintToken } from './Models';

// `LockAndMintService` implementation
export class LockAndMintServiceImpl implements LockAndMintService {
  // Dependencies

  /// PersistentStore for storing current work
  private _persistentStore: LockAndMintServicePersistentStore;

  private _chainProvider: ChainProvider;

  /// API Client for RenVM
  private _rpcClient: RenVMRpcClientType;

  // Properties

  // Mint token
  private _mintToken: MintToken;

  // Version of renVM
  private _version: string;

  // Refreshing rate
  private _refreshingRate: number;

  // Minting rate
  // private _mintingRate: number;

  // Flag to indicate of whether log should be shown or not
  private _showLog: boolean;

  // Response from gateway address
  private _gatewayAddressResponse?: GatewayAddressResponse;

  // Loaded lockAndMint
  private _lockAndMint?: LockAndMint;

  // Chain
  private _chain?: RenVMChainType;

  // Tasks for cancellation
  private _tasks: Set<CancellablePromise<any>> = new Set();

  // Delegate
  delegate?: LockAndMintServiceDelegate;

  // Indicator isLoading
  isLoading = false;

  constructor({
    persistentStore,
    chainProvider,
    rpcClient,
    mintToken,
    version = '1',
    refreshingRate = 5_000,
    // mintingRate = 60_000,
    showLog,
  }: {
    persistentStore: LockAndMintServicePersistentStore;
    chainProvider: ChainProvider;
    rpcClient: RenVMRpcClientType;
    mintToken: MintToken;
    version?: string;
    refreshingRate?: number;
    mintingRate?: number;
    showLog: boolean;
  }) {
    this._persistentStore = persistentStore;
    this._chainProvider = chainProvider;
    this._rpcClient = rpcClient;
    this._mintToken = mintToken;
    this._version = version;
    this._refreshingRate = refreshingRate;
    // this._mintingRate = mintingRate;
    this._showLog = showLog;
  }

  // Start the service
  async resume(): Promise<void> {
    this._clean();

    // resume current session if any
    const session = this._persistentStore.session;
    if (!session?.isValid) {
      return;
    }

    // resume
    await this._resume();
  }

  // Create new session
  async createSession(endAt?: Date): Promise<void> {
    // clean
    this._clean();

    // create session
    const session = new Session({ createdAt: new Date(), endAt });

    // save session
    this._persistentStore.saveSession(session);

    // resume
    await this._resume();
  }

  expireCurrentSession(): void {
    // clean
    this._clean();

    // clear
    this._persistentStore.clearAll();
  }

  // Private

  // Clean all current set up
  private _clean(): void {
    this._persistentStore.markAllTransactionsAsNotProcessing();
    this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);

    this._tasks.forEach((task) => task.cancel('clean'));
  }

  // Resume the current session
  private async _resume(): Promise<void> {
    // loading
    this.delegate?.lockAndMintServiceWillStartLoading();
    this.isLoading = true;

    try {
      // get account
      const account = await this._chainProvider.getAccount();

      // load chain
      this._chain = await this._chainProvider.load();

      // load lock and mint
      this._lockAndMint = new LockAndMint({
        rpcClient: this._rpcClient,
        chain: this._chain,
        mintTokenSymbol: this._mintToken.symbol,
        version: this._version,
        destinationAddress: account,
        session: this._persistentStore.session,
      });

      // save address
      this._gatewayAddressResponse = await this._lockAndMint.generateGatewayAddress();
      const address = this._chain.dataToAddress(this._gatewayAddressResponse.gatewayAddress);
      this._persistentStore.saveGatewayAddress(address);

      // continue previous works in a separated task
      const previousTask = this.submitIfNeededAndMintAllTransactionsInQueue();
      this._tasks.add(previousTask);

      // observe incomming transactions in a separated task
      const observingTask = async () => {
        while (true) {
          await this._getIncommingTransactionsAndMint();
          await CancellablePromise.delay(this._refreshingRate);
        }
      };
      // TODO: think its wrong. we need to cancel last loop
      this._tasks.add(pseudoCancellable(observingTask()));

      // loaded
      this.delegate?.lockAndMintServiceLoaded(address);
      this.isLoading = false;
    } catch (error) {
      // indicate error
      this.delegate?.lockAndMintServiceWithError();
      this.isLoading = false;

      console.error(error);
    }
  }

  // Get incomming transactions and mint
  private async _getIncommingTransactionsAndMint(): Promise<void> {
    const address = this._persistentStore.gatewayAddress;
    if (!address) {
      return;
    }

    // get incomming transaction
    let incommingTransactions;
    try {
      incommingTransactions = await this._rpcClient.getIncomingTransactions(address);
    } catch (e) {
      return;
    }

    // detect action for each incomming transactions, save status for future use
    const confirmedTxIds = [];
    for (const transaction of incommingTransactions) {
      // get marker date
      let date = new Date();
      const blocktime = transaction.status.blockTime; // TODO: check time, maybe need to multiply by 1000
      if (blocktime) {
        date = new Date(blocktime.toNumber());
      }

      // for confirmed transaction, do submit
      if (transaction.status.confirmed) {
        // check if transaction is invalid
        const tx: ProcessingTx | undefined = this._persistentStore.processingTransactions.find(
          (_tx) => _tx.tx.txid === transaction.txid,
        );
        if (tx && tx.validationStatus.type !== ValidationStatusType.valid) {
          if (this._showLog) {
            Logger.log(
              `Transaction ${transaction.txid} is being ignored because it is ${tx.validationStatus.type}`,
              LogEvent.event,
            );
          }
        } else {
          // mark as confirmed
          this._persistentStore.markAsConfirmed(transaction, date);
          this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
        }

        // save to submit
        confirmedTxIds.push(transaction.txid);
      }

      // for inconfirming transaction, mark as received and wait
      else {
        // mark as received
        this._persistentStore.markAsReceived(transaction, date);
        this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
      }
    }

    // submit if needed and mint
    await this.submitIfNeededAndMintAllTransactionsInQueue();
  }

  // Submit if needed and mint array of tx
  submitIfNeededAndMintAllTransactionsInQueue(): CancellablePromise<void> {
    return buildCancellablePromise(async (capture) => {
      // get all transactions that are valid and are not being processed
      const groupedTransactions = ProcessingTx.grouped(
        this._persistentStore.processingTransactions,
      );
      const confirmedAndSubmitedTransactions = groupedTransactions.confirmed.concat(
        groupedTransactions.submitted,
      );
      const transactionsToBeProcessed = confirmedAndSubmitedTransactions.filter(
        (_tx) => !_tx.isProcessing && _tx.validationStatus.type === ValidationStatusType.valid,
      );

      // mark as processing
      for (const tx of transactionsToBeProcessed) {
        this._persistentStore.markAsProcessing(tx);
        this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
      }

      // process transactions simutaneously
      await capture(
        CancellablePromise.all(
          transactionsToBeProcessed.map(async (tx) => {
            try {
              await this.submitIfNeededAndMint(tx);
            } catch (error) {
              console.error(error);
              // TODO: check it works
              if ((error as RenVMError).message.startsWith('insufficient amount after fees')) {
                this._persistentStore.markAsInvalid(tx.tx.txid, (error as RenVMError).message);
                this.delegate?.lockAndMintServiceUpdated(
                  this._persistentStore.processingTransactions,
                );
              }

              if (this._showLog) {
                Logger.log(
                  `Could not mint transaction with id ${tx.tx.txid}, error: ${error}`,
                  LogEvent.error,
                );
              }
            }
          }),
        ),
      );
    });
  }

  // Submit if needed and mint tx
  submitIfNeededAndMint(tx: ProcessingTx): CancellablePromise<void> {
    return buildCancellablePromise(async (capture) => {
      const account = await capture(pseudoCancellable(this._chainProvider.getAccount()));

      const response = this._gatewayAddressResponse;
      const lockAndMint = this._lockAndMint;
      const chain = this._chain;
      if (!response || !lockAndMint || !chain) {
        throw RenVMError.unknown();
      }

      // get state
      const state = lockAndMint.getDepositState({
        transactionHash: tx.tx.txid,
        txIndex: String(tx.tx.vout),
        amount: String(tx.tx.value),
        to: response.sendTo,
        gHash: response.gHash,
        gPubkey: response.gPubkey,
      });

      // submit
      if (!tx.submittedAt) {
        try {
          const hash = await capture(lockAndMint.submitMintTransaction(state));
          console.debug(`submited transaction with hash: ${hash}`);
          this._persistentStore.markAsSubmitted(tx.tx, new Date());
          this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
        } catch (error) {
          console.error(error);
          // try to mint event if error
        }
      }

      // mint
      await capture(
        cancellablePromiseRetry(
          (retry) => {
            return lockAndMint.mint({ state, account }).catch((error) => {
              console.error(error);
              if (!chain.isAlreadyMintedError(error as Error)) {
                if (RenVMError.equals(error as RenVMError, RenVMError.paramsMissing())) {
                  retry(error);
                } else {
                  throw error;
                }
              }
              // already minted
            });
          },
          {
            forever: true,
            maxTimeout: 5_000,
          },
        ),
      );

      this._persistentStore.markAsMinted(tx.tx, new Date());
      this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
    });
  }

  async getFee(): Promise<u64> {
    return await this._rpcClient.getTransactionFee(this._mintToken.symbol);
  }
}
