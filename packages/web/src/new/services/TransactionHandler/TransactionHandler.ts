import { ZERO } from '@orca-so/sdk';
import { PublicKey } from '@solana/web3.js';
import promiseRetry from 'promise-retry';
import { injectable } from 'tsyringe';

import { FeeTypeEnum } from 'new/app/models/PayingFee';
import { PendingTransaction, TransactionStatus } from 'new/app/models/PendingTransaction';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import {
  getAssociatedTokenAddressSync,
  SolanaSDKError,
  SolanaSDKPublicKey,
  toLamport,
} from 'new/sdk/SolanaSDK';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { AccountObservableService } from 'new/services/Socket';
import { SolanaService } from 'new/services/SolanaService';
import type { RawTransactionType } from 'new/ui/modals/ProcessTransactionModal';
import * as ProcessTransaction from 'new/ui/modals/ProcessTransactionModal/ProcessTransaction.Models';
import type { Emitter } from 'new/utils/libs/nanoEvent';
import { createNanoEvent } from 'new/utils/libs/nanoEvent';

type TransactionIndex = number;

interface TransactionHandlerType {
  sendTransaction(processingTransaction: RawTransactionType): TransactionIndex;
  observeTransaction(transactionIndex: TransactionIndex): PendingTransaction | null; // TODO: observable
  areSomeTransactionsInProgress(): boolean;

  observeProcessingTransactions(account: string): SolanaSDK.ParsedTransaction[]; // TODO: observable
  observeProcessingTransactionsAll(): SolanaSDK.ParsedTransaction[]; // TODO: observable

  getProccessingTransactions(account: string): SolanaSDK.ParsedTransaction[];
  getProccessingTransactionAll(): SolanaSDK.ParsedTransaction[];

  readonly onNewTransaction: Emitter<[{ trx: PendingTransaction; index: number }]>['on']; // TODO: observable
}

@injectable()
export class TransactionHandler implements TransactionHandlerType {
  transactions: PendingTransaction[] = [];
  private _onNewTransactionEmitter =
    createNanoEvent<[{ trx: PendingTransaction; index: number }]>(); // new EventEmitter<{ trx: PendingTransaction; index: number }>();
  onNewTransaction: Emitter<[{ trx: PendingTransaction; index: number }]>['on'] =
    this._onNewTransactionEmitter.on;

  constructor(
    private _apiClient: SolanaService,
    private _walletsRepository: WalletsRepository,
    private _pricesService: PricesService,
    private _socket: AccountObservableService,
  ) {}

  sendTransaction(processingTransaction: RawTransactionType): TransactionIndex {
    // get index to return
    const txIndex = this.transactions.length;

    // add to processing
    const trx = new PendingTransaction({
      transactionId: null,
      sentAt: new Date(),
      rawTransaction: processingTransaction,
      status: TransactionStatus.sending(),
    });

    const value = this.transactions;
    value.push(trx);

    this.transactions = value;
    this._onNewTransactionEmitter.emit({ trx, index: txIndex });

    // process
    this.sendAndObserve({ index: txIndex, processingTransaction });

    return txIndex;
  }

  observeTransaction(transactionIndex: TransactionIndex): PendingTransaction | null {
    return this.transactions[transactionIndex] ?? null;
  }

  areSomeTransactionsInProgress(): boolean {
    return this.transactions.some((tx) => tx.status.isProcessing);
  }

  // observeProcessingTransactions(account: string): SolanaSDK.ParsedTransaction[] {}
  // observeProcessingTransactionsAll(): SolanaSDK.ParsedTransaction[] {}

  getProccessingTransactions(account: string): SolanaSDK.ParsedTransaction[] {
    return this.transactions
      .filter((pt) => {
        const transaction = pt.rawTransaction;
        switch (transaction.constructor) {
          case ProcessTransaction.SendTransaction: {
            if (
              (transaction as ProcessTransaction.SendTransaction).sender.pubkey === account ||
              (transaction as ProcessTransaction.SendTransaction).receiver.address === account ||
              (transaction as ProcessTransaction.SendTransaction).authority === account
            ) {
              return true;
            }
            break;
          }
          case ProcessTransaction.SwapTransaction: {
            if (
              (transaction as ProcessTransaction.SwapTransaction).sourceWallet.pubkey === account ||
              (transaction as ProcessTransaction.SwapTransaction).destinationWallet.pubkey ===
                account ||
              (transaction as ProcessTransaction.SwapTransaction).authority === account
            ) {
              return true;
            }
            break;
          }
          default:
            break;
        }
        return false;
      })
      .map((pt) => {
        return pt.parse({
          pricesService: this._pricesService,
          authority: this._walletsRepository.nativeWallet?.pubkey,
        });
      })
      .filter((tx): tx is SolanaSDK.ParsedTransaction => Boolean(tx));
  }

  getProcessingTransactionAll(): SolanaSDK.ParsedTransaction[] {
    return this.transactions
      .map((pt) => {
        return pt.parse({
          pricesService: this._pricesService,
          authority: this._walletsRepository.nativeWallet?.pubkey,
        });
      })
      .filter((tx): tx is SolanaSDK.ParsedTransaction => Boolean(tx));
  }

  // Send and observe transaction
  async sendAndObserve({
    index,
    processingTransaction,
  }: {
    index: TransactionIndex;
    processingTransaction: RawTransactionType;
  }): Promise<void> {
    try {
      const transactionId = await processingTransaction.createRequest();

      // show notification
      // this._notificationsService.showInAppNotification(done(transactionHasBeenSent))

      // update status
      this._updateTransactionAtIndex(index, () => {
        return new PendingTransaction({
          transactionId,
          sentAt: new Date(),
          rawTransaction: processingTransaction,
          status: TransactionStatus.confirmed(0),
        });
      });

      // observe confirmations
      this.observe({ index, transactionId });
    } catch (error) {
      // update status
      // TODO: notification this._notificationsService.showInAppNotification(error(error));

      // mark transaction as failured
      this._updateTransactionAtIndex(index, (currentValue) => {
        const info = currentValue;
        info.status = TransactionStatus.error(error as Error);
        return info;
      });
    }
  }

  // Observe confirmation statuses of given transaction
  observe({ index, transactionId }: { index: TransactionIndex; transactionId: string }): void {
    promiseRetry(
      (_retry) =>
        this._apiClient.provider.connection.getSignatureStatus(transactionId).then((result) => {
          const status = result.value;
          if (!status) {
            throw SolanaSDKError.other('Invalid status');
          }

          let txStatus: TransactionStatus;
          if (!status.confirmations || status.confirmationStatus === 'finalized') {
            txStatus = TransactionStatus.finalized();
          } else {
            txStatus = TransactionStatus.confirmed(status.confirmations ?? 0);
          }

          this._updateTransactionAtIndex(index, (currentValue) => {
            const value = currentValue;
            value.status = txStatus;
            value.slot = status.slot;
            return value;
          });

          const confirmed = !status.confirmations || status.confirmationStatus === 'finalized';
          if (confirmed) {
            return null;
          } else {
            throw ProcessTransaction.ErrorType.notEnoughNumberOfConfirmations;
          }
        }),
      {
        retries: 10,
        minTimeout: 1000,
        maxTimeout: 60000,
        factor: 1,
      },
    );
  }

  // Update transaction
  private _updateTransactionAtIndex(
    index: TransactionIndex,
    update: (tx: PendingTransaction) => PendingTransaction,
  ): boolean {
    const value = this.transactions;

    const currentValue = value[index];
    if (currentValue) {
      const newValue = update(currentValue);

      // write to repository if the transaction is not yet written and there is at least 1 confirmation
      const numberOfConfirmations = newValue.status.numberOfConfirmations;
      if (!newValue.writtenToRepository && numberOfConfirmations && numberOfConfirmations > 0) {
        // manually update balances if socket is not connected
        this._updateRepository(newValue.rawTransaction);

        // mark as written
        newValue.writtenToRepository = true;
      }

      // update
      value[index] = newValue;
      this.transactions = value;
      return true;
    }

    return false;
  }

  private _updateRepository(rawTransaction: RawTransactionType): void {
    switch (rawTransaction.constructor) {
      case ProcessTransaction.SendTransaction: {
        if (this._socket.isConnected) {
          return;
        }

        this._walletsRepository.batchUpdate((currentValue) => {
          const wallets = currentValue;
          let index;

          // update sender
          index = wallets.findIndex(
            (wallet) =>
              wallet.pubkey ===
              (rawTransaction as ProcessTransaction.SendTransaction).sender.pubkey,
          );
          if (index) {
            wallets[index]!.decreaseBalance(
              (rawTransaction as ProcessTransaction.SendTransaction).amount,
            );
          }

          // update receiver if user send to different wallet of THIS account
          index = wallets.findIndex(
            (wallet) =>
              wallet.pubkey ===
              (rawTransaction as ProcessTransaction.SendTransaction).receiver.address,
          );
          if (index) {
            wallets[index]!.increaseBalance(
              (rawTransaction as ProcessTransaction.SendTransaction).amount,
            );
          }

          // update paying wallet
          index = wallets.findIndex(
            (wallet) =>
              wallet.pubkey ===
              (rawTransaction as ProcessTransaction.SendTransaction).payingFeeWallet?.pubkey,
          );
          if (index) {
            const feeInToken = (rawTransaction as ProcessTransaction.SendTransaction).feeInToken;
            if (feeInToken) {
              wallets[index]!.decreaseBalance(feeInToken.total);
            }
          }

          return wallets;
        });
        break;
      }
      case ProcessTransaction.CloseTransaction: {
        if (this._socket.isConnected) {
          return;
        }

        this._walletsRepository.batchUpdate((currentValue) => {
          let wallets = currentValue;
          let reimbursedAmount = (rawTransaction as ProcessTransaction.CloseTransaction)
            .reimbursedAmount;

          // remove closed wallet
          const wallet = (rawTransaction as ProcessTransaction.CloseTransaction).closingWallet;
          wallets = wallets.filter((item) => item.pubkey === wallet.pubkey);

          // if closing non-native Solana wallet, then convert its balances and send it to native Solana wallet
          if (wallet.token.symbol === 'SOL' && !wallet.token.isNative) {
            reimbursedAmount = reimbursedAmount.add(wallet.lamports ?? ZERO);
          }

          // update native wallet
          const index = wallets.findIndex((wallet) => wallet.isNativeSOL);
          if (index) {
            wallets[index]!.increaseBalance(reimbursedAmount);
          }

          return wallets;
        });
        break;
      }
      case ProcessTransaction.SwapTransaction: {
        this._walletsRepository.batchUpdate((currentValue) => {
          const wallets = currentValue;

          // update source wallet if socket is not connected
          if (!this._socket.isConnected) {
            const index = wallets.findIndex(
              (wallet) =>
                wallet.pubkey ===
                (rawTransaction as ProcessTransaction.SwapTransaction).sourceWallet.pubkey,
            );
            if (index) {
              wallets[index]!.decreaseBalance(
                toLamport(
                  (rawTransaction as ProcessTransaction.SwapTransaction).amount,
                  (rawTransaction as ProcessTransaction.SwapTransaction).sourceWallet.token
                    .decimals,
                ),
              );
            }
          }

          // update destination wallet if exists
          const index = wallets.findIndex(
            (wallet) =>
              wallet.pubkey ===
              (rawTransaction as ProcessTransaction.SwapTransaction).destinationWallet.pubkey,
          );
          if (index) {
            // update only if socket is not connected
            if (!this._socket.isConnected) {
              wallets[index]!.increaseBalance(
                toLamport(
                  (rawTransaction as ProcessTransaction.SwapTransaction).estimatedAmount,
                  (rawTransaction as ProcessTransaction.SwapTransaction).destinationWallet.token
                    .decimals,
                ),
              );
            }
          } else {
            // add destination wallet if not exists, event when socket is connected, because socket doesn't handle new wallet
            let publicKey = null;
            try {
              const authority = (rawTransaction as ProcessTransaction.SwapTransaction).authority;
              if (!authority) {
                throw false;
              }

              publicKey = getAssociatedTokenAddressSync(
                new PublicKey(
                  (
                    rawTransaction as ProcessTransaction.SwapTransaction
                  ).destinationWallet.mintAddress,
                ),
                new PublicKey(authority),
                false,
                SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
                SolanaSDKPublicKey.tokenProgramId,
              );
            } catch {
              /// ignore
            }
            if (publicKey) {
              const destinationWallet = (rawTransaction as ProcessTransaction.SwapTransaction)
                .destinationWallet;
              destinationWallet.pubkey = publicKey.toString();
              destinationWallet.lamports = toLamport(
                (rawTransaction as ProcessTransaction.SwapTransaction).estimatedAmount,
                destinationWallet.token.decimals,
              );
              wallets.push(destinationWallet);
            }
          }

          // update paying wallet
          if (!this._socket.isConnected) {
            for (const fee of (rawTransaction as ProcessTransaction.SwapTransaction).fees) {
              switch (fee.type.type) {
                case FeeTypeEnum.accountCreationFee:
                case FeeTypeEnum.transactionFee: {
                  const index = wallets.findIndex(
                    (wallet) => wallet.mintAddress === fee.token.address,
                  );
                  if (index) {
                    wallets[index]!.decreaseBalance(fee.lamports);
                  }
                  break;
                }
                case FeeTypeEnum.liquidityProviderFee:
                case FeeTypeEnum.orderCreationFee:
                case FeeTypeEnum.depositWillBeReturned:
                  break;
              }
            }
          }

          return wallets;
        });
        break;
      }
      default:
        break;
    }
  }
}
