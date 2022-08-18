import { ZERO } from '@orca-so/sdk';
import { PublicKey } from '@solana/web3.js';

import { networkFeesAll } from 'new/app/models/PayingFee';
import type { RawTransactionType } from 'new/scenes/Main/ProcessTransaction';
import { SendTransaction, SwapTransaction } from 'new/scenes/Main/ProcessTransaction';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import {
  convertToBalance,
  getAssociatedTokenAddressSync,
  SolanaSDKPublicKey,
} from 'new/sdk/SolanaSDK';
import type { PricesServiceType } from 'new/services/PriceAPIs/PricesService';

enum TransactionStatusType {
  sending,
  confirmed,
  finalized,
  error,
}

export class TransactionStatus {
  type: TransactionStatusType;
  private readonly _numberOfConfirmed: number | null;
  private readonly _error: Error | null;

  static maxConfirmed = 31;

  private constructor({
    type,
    numberOfConfirmed = null,
    error = null,
  }: {
    type: TransactionStatusType;
    numberOfConfirmed?: number | null;
    error?: Error | null;
  }) {
    this.type = type;
    this._numberOfConfirmed = numberOfConfirmed;
    this._error = error;
  }

  // enum

  static sending(): TransactionStatus {
    return new TransactionStatus({
      type: TransactionStatusType.sending,
    });
  }

  static confirmed(numberOfConfirmed: number): TransactionStatus {
    return new TransactionStatus({
      type: TransactionStatusType.confirmed,
      numberOfConfirmed,
    });
  }

  static finalized(): TransactionStatus {
    return new TransactionStatus({
      type: TransactionStatusType.finalized,
    });
  }

  static error(error: Error): TransactionStatus {
    return new TransactionStatus({
      type: TransactionStatusType.error,
      error,
    });
  }

  // getters

  get numberOfConfirmations(): number | null {
    switch (this.type) {
      case TransactionStatusType.confirmed:
        return this._numberOfConfirmed;
      default:
        return null;
    }
  }

  get isProcessing(): boolean {
    switch (this.type) {
      case TransactionStatusType.sending:
      case TransactionStatusType.confirmed:
        return true;
      default:
        return false;
    }
  }

  get progress(): number {
    switch (this.type) {
      case TransactionStatusType.sending:
        return 0;
      case TransactionStatusType.confirmed: {
        // treat all number of confirmed as unfinalized
        let numberOfConfirmations = this.numberOfConfirmations!;
        if (numberOfConfirmations >= TransactionStatus.maxConfirmed) {
          numberOfConfirmations = TransactionStatus.maxConfirmed - 1;
        }
        return numberOfConfirmations / TransactionStatus.maxConfirmed;
      }
      case TransactionStatusType.finalized:
      case TransactionStatusType.error:
        return 1;
    }
  }

  get error(): Error | null {
    switch (this.type) {
      case TransactionStatusType.error:
        return this._error;
      default:
        return null;
    }
  }

  get rawValue(): string {
    switch (this.type) {
      case TransactionStatusType.sending:
        return 'sending';
      case TransactionStatusType.confirmed:
        return `processing(${this._numberOfConfirmed!})`;
      case TransactionStatusType.finalized:
        return 'finalized';
      case TransactionStatusType.error:
        return 'error';
    }
  }
}

export class PendingTransaction {
  transactionId: SolanaSDK.TransactionID | null;
  sentAt: Date;
  writtenToRepository: boolean;
  rawTransaction: RawTransactionType;
  status: TransactionStatus;
  slot: number;

  constructor({
    transactionId,
    sentAt,
    writtenToRepository = false,
    rawTransaction,
    status,
    slot = 0,
  }: {
    transactionId: SolanaSDK.TransactionID | null;
    sentAt: Date;
    writtenToRepository?: boolean;
    rawTransaction: RawTransactionType;
    status: TransactionStatus;
    slot?: number;
  }) {
    this.transactionId = transactionId;
    this.sentAt = sentAt;
    this.writtenToRepository = writtenToRepository;
    this.rawTransaction = rawTransaction;
    this.status = status;
    this.slot = slot;
  }

  parse({
    pricesService,
    authority = null,
  }: {
    pricesService: PricesServiceType;
    authority?: string | null;
  }): SolanaSDK.ParsedTransaction | null {
    // status
    let status: SolanaSDK.Status;

    switch (this.status.type) {
      case TransactionStatusType.sending:
        status = SolanaSDK.Status.requesting();
        break;
      case TransactionStatusType.confirmed:
        status = SolanaSDK.Status.processing(0);
        break;
      case TransactionStatusType.finalized:
        status = SolanaSDK.Status.confirmed();
        break;
      case TransactionStatusType.error:
        status = SolanaSDK.Status.error(this.status.error?.message);
        break;
    }

    const signature = this.transactionId;

    let value: SolanaSDK.ParsedTransactionValueType | null;
    let amountInFiat: number | null;
    let fee: SolanaSDK.FeeAmount | null;

    const transaction = this.rawTransaction;
    switch (transaction.constructor) {
      case SendTransaction: {
        const amount = convertToBalance(
          (transaction as SendTransaction).amount,
          (transaction as SendTransaction).sender.token.decimals,
        );
        value = new SolanaSDK.TransferTransaction({
          source: (transaction as SendTransaction).sender,
          destination: new SolanaSDK.Wallet({
            pubkey: (transaction as SendTransaction).receiver.address,
            lamports: ZERO,
            token: (transaction as SendTransaction).sender.token,
          }),
          authority,
          destinationAuthority: null,
          amount,
          myAccount: (transaction as SendTransaction).sender.pubkey,
        });
        amountInFiat =
          amount *
          (pricesService.currentPrice((transaction as SendTransaction).sender.token.symbol)
            ?.value ?? 0);
        fee = (transaction as SendTransaction).feeInToken;
        break;
      }
      case SwapTransaction: {
        const destinationWallet = (transaction as SwapTransaction).destinationWallet;
        const mintAddress = new PublicKey(destinationWallet.mintAddress);
        if (authority && mintAddress) {
          const _authority = new PublicKey(authority);
          // TODO: use getAssociatedTokenAddressSync from spl-token when it will be published
          destinationWallet.pubkey = getAssociatedTokenAddressSync(
            mintAddress,
            _authority,
            false,
            SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
            SolanaSDKPublicKey.tokenProgramId,
          ).toString();
        }

        value = new SolanaSDK.SwapTransaction({
          source: (transaction as SwapTransaction).sourceWallet,
          sourceAmount: (transaction as SwapTransaction).amount,
          destination: destinationWallet,
          destinationAmount: (transaction as SwapTransaction).estimatedAmount,
          myAccountSymbol: null,
        });
        amountInFiat =
          (transaction as SwapTransaction).amount *
          (pricesService.currentPrice((transaction as SwapTransaction).sourceWallet.token.symbol)
            ?.value ?? 0);
        fee = networkFeesAll((transaction as SwapTransaction).fees);
        break;
      }
      default:
        return null;
    }

    return new SolanaSDK.ParsedTransaction({
      status,
      signature,
      value,
      amountInFiat,
      slot: this.slot,
      blockTime: this.sentAt,
      fee,
      blockhash: null,
    });
  }
}
