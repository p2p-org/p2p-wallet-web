import { singleton } from 'tsyringe';

import type { GatewayAddressResponse } from '../../../actions/LockAndMint';
import {
  LockAndMint,
  LockAndMintProcessingTx,
  LockAndMintSession,
  ValidationStatus,
} from '../../../actions/LockAndMint';
import type { RenVMChainType } from '../../../chains/RenVMChainType';
import { RenVMError } from '../../../models';
import { RenVMRpcClientType } from '../../../RPCClient/RPCClient';
import { ChainProvider } from '../../ChainProvider';
import type { LockAndMintServiceDelegate } from '../LoackAndMintServiceDelegate';
import type { LockAndMintService } from '../LockAndMintService';
import { LockAndMintServicePersistentStore } from '../LockAndMintServicePersistentStore';
import { MintToken } from './Models';

@singleton()
export class LockAndMintServiceImpl implements LockAndMintService {
  mintToken = MintToken.bitcoin;
  version = '1';
  refreshingRate = 5_000;
  mintingRate = 60_000;
  gatewayAddressResponse?: GatewayAddressResponse;
  lockAndMint?: LockAndMint;
  chain?: RenVMChainType;
  tasks: Set<NodeJS.Timeout> = new Set();
  delegate?: LockAndMintServiceDelegate;
  isLoading = false;

  constructor(
    private _persistentStore: LockAndMintServicePersistentStore,
    private _chainProvider: ChainProvider,
    private _rpcClient: RenVMRpcClientType,
  ) {}

  async resume() {
    this._clean();

    // resume current session if any
    const session = this._persistentStore.session;
    if (!session.isValid) {
      return;
    }

    // resume
    await this._resume();
  }

  async createSession(endAt?: number) {
    this._clean();

    const session = new LockAndMintSession({ createdAt: Date.now(), endAt });

    this._persistentStore.saveSession(session);

    await this._resume();
  }

  expireCurrentSession() {
    this._clean();

    this._persistentStore.clearAll();
  }

  private _clean() {
    this._persistentStore.markAllTransactionsAsNotProcessing();
    this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);

    this.tasks.forEach((taskId) => clearTimeout(taskId));
    this.tasks.clear();
  }

  private async _resume(): Promise<void> {
    // loading
    this.delegate?.lockAndMintServiceWillStartLoading();
    this.isLoading = true;

    try {
      // get account
      const account = await this._chainProvider.getAccount();

      // load chain
      const chain = await this._chainProvider.load();

      // load lock and mint
      this.lockAndMint = new LockAndMint({
        rpcClient: this._rpcClient,
        chain,
        mintTokenSymbol: this.mintToken.symbol,
        version: this.version,
        destinationAddress: account.publicKey,
        session: this._persistentStore.session,
      });

      // save address
      const gatewayAddressResponse = await this.lockAndMint.generateGatewayAddress();
      const address = chain.dataToAddress(gatewayAddressResponse.gatewayAddress);
      this._persistentStore.saveGatewayAddress(address);

      // continue previous works
      const previousTask = setTimeout(async () => {
        await this.submitIfNeededAndMintAllTransactionsInQueue();
      });
      this.tasks.add(previousTask);

      //TODO: check cancelation

      // observe incomming transactions
      const observeIncoming = async () => {
        await this._getIncommingTransactionsAndMint();

        this.tasks.delete(observingTask);
        observingTask = setTimeout(observeIncoming, this.refreshingRate); // 5 seconds
        this.tasks.add(observingTask);
      };
      let observingTask = setTimeout(observeIncoming);
      this.tasks.add(observingTask);

      // loaded
      this.delegate?.lockAndMintServiceLoaded(address);
      this.isLoading = false;
    } catch (error) {
      // indicate error
      this.delegate?.lockAndMintServiceWithError();
      this.isLoading = false;
    }
  }

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
      let date = Date.now();
      const blocktime = transaction.status.blockTime;
      if (blocktime) {
        //TODO: number or string here?
        date = new Date(Number(blocktime)).valueOf();
      }

      // for confirmed transaction, do submit
      if (transaction.status.confirmed) {
        // check if transaction is invalid
        const tx = this._persistentStore.processingTransactions.find(
          (_tx) => tx.tx.txid === transaction.txid,
        );
        if (tx && tx.validationStatus === ValidationStatus.valid()) {
          // mark as confirmed
          this._persistentStore.markAsConfirmed(transaction, date);
          this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
        }

        // save to submit
        confirmedTxIds.push(transaction.txid);
      } else {
        // for inconfirming transaction, mark as received and wait
        this._persistentStore.markAsReceived(transaction, date);
        this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
      }
    }

    // submit if needed and mint
    await this.submitIfNeededAndMintAllTransactionsInQueue();
  }

  async submitIfNeededAndMintAllTransactionsInQueue(): Promise<void> {
    // get all transactions that are valid and are not being processed
    const groupedTransactions = LockAndMintProcessingTx.grouped(
      this._persistentStore.processingTransactions,
    );
    const confirmedAndSubmitedTransactions = [
      ...groupedTransactions.confirmed,
      ...groupedTransactions.submitted,
    ];
    const transactionsToBeProcessed = confirmedAndSubmitedTransactions.filter(
      (_tx) => _tx.isProcessing === false && _tx.validationStatus === ValidationStatus.valid(),
    );

    // mark as processing
    for (const tx of transactionsToBeProcessed) {
      this._persistentStore.markAsProcessing(tx);
      this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
    }

    // process transactions simutaneously
    await Promise.all(
      transactionsToBeProcessed.map(async (tx) => {
        try {
          await this.submitIfNeededAndMint(tx);
        } catch (error) {
          if ((error as RenVMError).message.startsWith('insufficient amount after fees')) {
            this._persistentStore.markAsInvalid(tx.tx.txid, (error as RenVMError).message);
            this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
          }
        }
      }),
    );
  }

  async submitIfNeededAndMint(tx: LockAndMintProcessingTx) {
    const account = await this._chainProvider.getAccount();

    if (!(this.gatewayAddressResponse && this.lockAndMint && this.chain)) {
      throw RenVMError.unknown;
    }

    // get state
    const state = this.lockAndMint.getDepositState({
      transactionHash: tx.tx.txid,
      txIndex: String(tx.tx.vout),
      amount: String(tx.tx.value),
      to: this.gatewayAddressResponse.sendTo,
      gHash: this.gatewayAddressResponse.gHash,
      gPubkey: this.gatewayAddressResponse.gPubkey,
    });

    // submit
    if (!tx.submittedAt) {
      try {
        // const hash = await this.lockAndMint.submitMintTransaction(state);
        // console.log(`submited transaction with hash: ${hash}`);
        this._persistentStore.markAsSubmitted(tx.tx, Date.now());
        this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
      } catch (error) {
        console.error(error);
        // try to mint event if error
      }
    }

    // mint
    const repeatMint = async () => {
      try {
        await this.lockAndMint.mint(state, account.secret);
      } catch (error) {
        // other error
        if (!this.chain?.isAlreadyMintedError(error as Error)) {
          if (RenVMError.equals(error as RenVMError, RenVMError.paramMissing())) {
            this.tasks.delete(repeatTask);
            repeatTask = setTimeout(repeatMint, 5000);
            this.tasks.add(repeatTask);
          } else {
            throw error;
          }
        }
        // already minted
      }
    };
    let repeatTask = setTimeout(repeatMint);

    this._persistentStore.markAsMinted(tx.tx, Date.now());
    this.delegate?.lockAndMintServiceUpdated(this._persistentStore.processingTransactions);
  }
}
