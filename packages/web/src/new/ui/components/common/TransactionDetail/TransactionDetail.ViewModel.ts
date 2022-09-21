import { action, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { TransferInfo } from 'new/sdk/TransactionParser';
import { NameService } from 'new/services/NameService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import type { TransactionIndex } from 'new/services/TransactionHandler';
import { TransactionHandler } from 'new/services/TransactionHandler';
import { withNameServiceDomain } from 'new/utils/StringExtensions';

interface TransactionDetailViewModelType {
  parsedTransaction: ParsedTransaction | null;
  senderName: string | null;
  receiverName: string | null;
}

@injectable()
export class TransactionDetailViewModel
  extends ViewModel
  implements TransactionDetailViewModelType
{
  observingTransactionIndex: TransactionIndex | null;
  payingFeeWallet: Wallet | null;

  parsedTransaction: ParsedTransaction | null;
  senderName: string | null;
  receiverName: string | null;

  constructor(
    private _transactionHandler: TransactionHandler,
    private _pricesService: PricesService,
    private _walletsRepository: WalletsRepository,
    private _nameService: NameService,
  ) {
    super();

    this.observingTransactionIndex = null;
    this.payingFeeWallet = null;

    this.parsedTransaction = null;
    this.senderName = null;
    this.receiverName = null;

    makeObservable(this, {
      observingTransactionIndex: observable,
      payingFeeWallet: observable,

      parsedTransaction: observable,
      senderName: observable,
      receiverName: observable,

      setParsedTransaction: action,
      setObservingTransactionIndex: action,
    });
  }

  setParsedTransaction(parsedTransaction: ParsedTransaction): void {
    this.observingTransactionIndex = null;
    this.parsedTransaction = parsedTransaction;

    void this._mapNames(parsedTransaction);
  }

  setObservingTransactionIndex(observingTransactionIndex: TransactionIndex): void {
    this.observingTransactionIndex = observingTransactionIndex;
    this.parsedTransaction = null;

    this._bind();
  }

  protected override setDefaults(): void {
    this.observingTransactionIndex = null;
    this.payingFeeWallet = null;

    this.parsedTransaction = null;
    this.senderName = null;
    this.receiverName = null;
  }

  protected override onInitialize(): void {}

  protected override afterReactionsRemoved(): void {}

  // bind only on observingTransactionIndex provide
  private _bind(): void {
    this.addReaction(
      reaction(
        () => this._transactionHandler.transactions,
        () => {
          const pendingTransaction = this._transactionHandler.observeTransaction(
            this.observingTransactionIndex!,
          );
          this.payingFeeWallet = pendingTransaction?.rawTransaction.payingWallet ?? null;

          this.parsedTransaction =
            pendingTransaction?.parse({
              pricesService: this._pricesService,
              authority: this._walletsRepository.nativeWallet?.pubkey,
            }) ?? null;

          void this._mapNames(this.parsedTransaction);
        },
      ),
    );
  }

  private async _mapNames(parsedTransaction: ParsedTransaction | null) {
    let fromAddress: string | null;
    let toAddress: string | null;

    const transaction = parsedTransaction?.info;
    switch (transaction?.constructor) {
      case TransferInfo: {
        fromAddress =
          (transaction as TransferInfo).authority ??
          (transaction as TransferInfo).source?.pubkey ??
          null;
        toAddress =
          (transaction as TransferInfo).destinationAuthority ??
          (transaction as TransferInfo).destination?.pubkey ??
          null;
        break;
      }
      default:
        return;
    }

    if (!fromAddress && !toAddress) {
      return;
    }

    const fromName = fromAddress ? await this._nameService.getName(fromAddress) : null;
    const toName = toAddress ? await this._nameService.getName(toAddress) : null;

    this.senderName = fromName ? withNameServiceDomain(fromName) : null;
    this.receiverName = toName ? withNameServiceDomain(toName) : null;
  }

  // TODO: navigationTitle

  // TODO: isSummaryAvailableDriver

  // TODO: isSummaryAvailableDriver

  // TODO: getTransactionId

  // TODO: getCreatedAccountSymbol

  // TODO: getAmountInCurrentFiat

  // TODO: copyTransactionIdToClipboard

  // TODO: copySourceAddressToClipboard

  // TODO: copyDestinationAddressToClipboard
}
