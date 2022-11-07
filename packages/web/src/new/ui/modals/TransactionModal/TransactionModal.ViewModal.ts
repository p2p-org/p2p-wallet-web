import { ZERO } from '@orca-so/sdk';
import dayjs from 'dayjs';
import { action, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { ImageViewType } from 'new/scenes/Main/WalletDetail/History/TransactionCollectionView/TransactionImageView';
import { convertToBalance, Wallet } from 'new/sdk/SolanaSDK';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { StatusType, SwapInfo, TransferInfo, TransferType } from 'new/sdk/TransactionParser';
import { Defaults } from 'new/services/Defaults';
import { NameService } from 'new/services/NameService';
import { NotificationService } from 'new/services/NotificationService';
import type { PricesServiceType } from 'new/services/PriceAPIs/PricesService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import type { Model } from 'new/ui/modals/TransactionModal/TransactionModal';
import { copyToClipboardString } from 'new/utils/Clipboard';
import { numberToString } from 'new/utils/NumberExtensions';
import {
  parsedTransactionStatusIndicatorColor,
  parsedTransactionStatusLabel,
} from 'new/utils/SolanaSDK.ParsedTransaction.StatusExtensions';
import { parsedTransactionIcon } from 'new/utils/SolanaSDK.ParsedTransactionExtensions';
import { truncatingMiddle, withNameServiceDomain } from 'new/utils/StringExtensions';

@injectable()
export class TransactionModalViewModel extends ViewModel {
  private _transaction: ParsedTransaction | null = null;
  model: Model | null = null;

  constructor(
    private _pricesService: PricesService,
    private _nameService: NameService,
    private _notificationService: NotificationService,
  ) {
    super();

    makeObservable<this, '_transaction'>(this, {
      _transaction: observable,
      model: observable,

      setTransaction: action,
    });
  }

  protected override setDefaults(): void {}

  protected override onInitialize(): void {
    this.addReaction(
      reaction(
        () => this._transaction,
        async (transaction) => {
          if (!transaction) {
            this.model = null;
            return;
          }

          const username = await getUsername({
            transaction,
            nameService: this._nameService,
          });

          this.model = mapTransaction({
            transaction,
            pricesService: this._pricesService,
            username,
          });
        },
      ),
    );
  }

  protected override afterReactionsRemoved(): void {}

  setTransaction(transaction: ParsedTransaction): void {
    this._transaction = transaction;
  }

  copyTransactionId(): void {
    if (!this._transaction?.signature) {
      return;
    }
    this._copy(this._transaction.signature);
  }

  copyUsername(): void {
    if (!this.model?.username) {
      return;
    }
    this._copy(this.model.username);
  }

  copyAddress(keyPath: 'address' | 'addresses.from' | 'addresses.to'): void {
    if (!this._transaction) {
      return;
    }

    switch (keyPath) {
      case 'address': {
        const address = getAddress(this._transaction);
        return address ? this._copy(address) : undefined;
      }
      case 'addresses.from': {
        const address = getRawAddresses(this._transaction).from;
        return address ? this._copy(address) : undefined;
      }
      case 'addresses.to': {
        const address = getRawAddresses(this._transaction).to;
        return address ? this._copy(address) : undefined;
      }
      default:
        return;
    }
  }

  private _copy(value: string): void {
    void copyToClipboardString(
      value,
      () => this._notificationService.info(`Copied!`),
      (error: Error) => console.error(error),
    );
  }
}

// Mappers

function mapTransaction({
  transaction,
  pricesService,
  username,
}: {
  transaction: ParsedTransaction;
  pricesService: PricesServiceType;
  username: string | null;
}): Model {
  const amounts = mapAmounts({ transaction, pricesService });
  const _address = getAddress(transaction);
  return {
    imageType: imageType(transaction),
    amount: amounts.tokens,
    usdAmount: amounts.usd,
    blockTime: transaction.blockTime ? dayjs(transaction.blockTime).format('LLL') : '',
    transactionId: transaction.signature
      ? truncatingMiddle(transaction.signature, {
          numOfSymbolsRevealed: 9,
          numOfSymbolsRevealedInSuffix: 9,
        })
      : '',
    address: _address
      ? truncatingMiddle(_address, {
          numOfSymbolsRevealed: 9,
          numOfSymbolsRevealedInSuffix: 9,
        })
      : null,
    addresses: getAddresses(transaction),
    username,
    fee: mapFee(transaction),
    status: {
      text: parsedTransactionStatusLabel(transaction),
      color: parsedTransactionStatusIndicatorColor(transaction),
    },
  };
}

function imageType(transaction: ParsedTransaction): {
  imageType: ImageViewType;
  statusImage: string | null;
} {
  let statusImage: string | null = null;
  switch (transaction.status.type) {
    case StatusType.requesting:
    case StatusType.processing:
      statusImage = 'clock'; // @ios: transactionIndicatorPending
      break;
    case StatusType.error:
      statusImage = 'warning'; // @ios: transactionIndicatorError
      break;
    default:
      break;
  }

  switch (transaction.info?.constructor) {
    case SwapInfo:
      return {
        imageType: {
          fromOneToOne: {
            from: (transaction.info as SwapInfo).source?.token,
            to: (transaction.info as SwapInfo).destination?.token,
          },
        },
        statusImage,
      };
    default:
      return {
        imageType: { oneImage: parsedTransactionIcon(transaction) },
        statusImage,
      };
  }
}

function mapAmounts({
  transaction,
  pricesService,
}: {
  transaction: ParsedTransaction;
  pricesService: PricesServiceType;
}): { tokens: string | null; usd: string | null } {
  switch (transaction.info?.constructor) {
    case TransferInfo: {
      const _transaction = transaction.info as TransferInfo;
      const fromAmount = `${numberToString(_transaction.rawAmount ?? 0, {
        maximumFractionDigits: 9,
      })} ${_transaction.source?.token.symbol}`;
      const usd = `~ ${Defaults.fiat.symbol}${numberToString(
        getAmountInCurrentFiat({
          pricesService,
          amountInToken: _transaction.rawAmount,
          symbol: _transaction.source?.token.symbol,
        }) ?? 0,
        { maximumFractionDigits: 2 },
      )}`;
      return { tokens: fromAmount, usd };
    }
    case SwapInfo: {
      const _transaction = transaction.info as SwapInfo;
      const fromAmount = `${numberToString(_transaction.sourceAmount ?? 0, {
        maximumFractionDigits: 9,
      })} ${_transaction.source?.token.symbol}`;
      const toAmount = `${numberToString(_transaction.destinationAmount ?? 0, {
        maximumFractionDigits: 9,
      })} ${_transaction.destination?.token.symbol}`;
      const usd = Math.max(
        getAmountInCurrentFiat({
          pricesService,
          amountInToken: _transaction.sourceAmount,
          symbol: _transaction.source?.token.symbol,
        }) ?? 0,
        getAmountInCurrentFiat({
          pricesService,
          amountInToken: _transaction.destinationAmount,
          symbol: _transaction.destination?.token.symbol,
        }) ?? 0,
      );
      return {
        tokens: `${fromAmount} - ${toAmount}`,
        usd: `~ ${Defaults.fiat.symbol}${numberToString(usd, { maximumFractionDigits: 2 })}`,
      };
    }
    default:
      return { tokens: null, usd: null };
  }
}

function getAmountInCurrentFiat({
  pricesService,
  amountInToken,
  symbol,
}: {
  pricesService: PricesServiceType;
  amountInToken?: number | null;
  symbol?: string;
}): number | null {
  if (!amountInToken || !symbol) {
    return null;
  }
  const price = pricesService.currentPrice(symbol)?.value;
  if (!price) {
    return null;
  }
  return amountInToken * price;
}

function getAddresses(transaction: ParsedTransaction): { from: string | null; to: string | null } {
  const { from, to } = getRawAddresses(transaction);
  switch (transaction.info?.constructor) {
    case TransferInfo:
      switch ((transaction.info as TransferInfo).transferType) {
        default:
          return { from: null, to: null };
      }
    default:
      return {
        from: from
          ? truncatingMiddle(from, { numOfSymbolsRevealed: 9, numOfSymbolsRevealedInSuffix: 9 })
          : null,
        to: to
          ? truncatingMiddle(to, { numOfSymbolsRevealed: 9, numOfSymbolsRevealedInSuffix: 9 })
          : null,
      };
  }
}

function getAddress(transaction: ParsedTransaction): string | null {
  const { from, to } = getRawAddresses(transaction);
  switch (transaction.info?.constructor) {
    case TransferInfo:
      switch ((transaction.info as TransferInfo).transferType) {
        case TransferType.send:
          return to;
        case TransferType.receive:
          return from;
        default:
          return to;
      }
    default:
      break;
  }
  return null;
}

function getRawAddresses(transaction: ParsedTransaction): {
  from: string | null;
  to: string | null;
} {
  let from: string | null;
  switch (transaction.info?.constructor) {
    case SwapInfo:
      from = (transaction.info as SwapInfo).source?.pubkey ?? null;
      break;
    case TransferInfo:
      from = (transaction.info as TransferInfo).source?.pubkey ?? null;
      break;
    default:
      from = null;
      break;
  }

  let to: string | null;
  switch (transaction.info?.constructor) {
    case SwapInfo:
      to = (transaction.info as SwapInfo).destination?.pubkey ?? null;
      break;
    case TransferInfo:
      to = (transaction.info as TransferInfo).destination?.pubkey ?? null;
      break;
    default:
      to = null;
      break;
  }

  return { from, to };
}

async function getUsername({
  transaction,
  nameService,
}: {
  transaction: ParsedTransaction;
  nameService: NameService;
}): Promise<string | null> {
  let address: string | null;
  switch (transaction.info?.constructor) {
    case TransferInfo:
      switch ((transaction.info as TransferInfo).transferType) {
        case TransferType.send:
          address =
            (transaction.info as TransferInfo).destinationAuthority ??
            (transaction.info as TransferInfo).destination?.pubkey ??
            null;
          break;
        case TransferType.receive:
          address =
            (transaction.info as TransferInfo).authority ??
            (transaction.info as TransferInfo).source?.pubkey ??
            null;
          break;
        default:
          address =
            (transaction.info as TransferInfo).destinationAuthority ??
            (transaction.info as TransferInfo).destination?.pubkey ??
            null;
          break;
      }
      break;
    default:
      address = null;
      break;
  }

  if (!address) {
    return null;
  }
  try {
    const _name = await nameService.getName(address);
    return _name ? withNameServiceDomain(_name) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export type Fee = {
  text: string;
  color: string;
};

function mapFee(transaction: ParsedTransaction): Fee {
  const payingWallet = Wallet.nativeSolana({ pubkey: null, lamports: ZERO });
  const feeAmount = transaction.fee;

  const amount = feeAmount?.accountBalances
    ? convertToBalance(feeAmount.accountBalances, payingWallet.token.decimals)
    : 0;
  const transferAmount = feeAmount?.transaction
    ? convertToBalance(feeAmount.transaction, payingWallet.token.decimals)
    : 0;
  const swapFee = convertToBalance(
    (feeAmount?.transaction ?? ZERO).add(feeAmount?.accountBalances ?? ZERO),
    payingWallet.token.decimals,
  );

  if (feeAmount?.transaction.eqn(0)) {
    return { text: 'Free by Key App', color: 'blue' };
  } else {
    return {
      text: `${numberToString(Math.max(amount, transferAmount, swapFee), {
        maximumFractionDigits: 9,
      })} ${payingWallet.token.symbol}`,
      color: '',
    };
  }
}
