import { computed, makeObservable, observable, reaction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { WalletModel } from 'new/models/WalletModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { LocationService } from 'new/services/LocationService';
import { ModalService, ModalType } from 'new/services/ModalService';
import { NotificationService } from 'new/services/NotificationService';
import { WalletsRepository } from 'new/services/Repositories';
import type { TransactionModalProps } from 'new/ui/modals/TransactionModal';
import { copyToClipboardImage, copyToClipboardString } from 'new/utils/Clipboard';

enum WalletActionTypeEnum {
  // receive = 'receive',
  // buy = 'buy',
  send = 'send',
  swap = 'swap',
}

class WalletActionType {
  type: WalletActionTypeEnum;

  private constructor(type: WalletActionTypeEnum) {
    this.type = type;
  }

  // static get receive(): WalletActionType {
  //   return new WalletActionType(WalletActionTypeEnum.receive);
  // }
  // static get buy(): WalletActionType {
  //   return new WalletActionType(WalletActionTypeEnum.buy);
  // }
  static get send(): WalletActionType {
    return new WalletActionType(WalletActionTypeEnum.send);
  }
  static get swap(): WalletActionType {
    return new WalletActionType(WalletActionTypeEnum.swap);
  }

  get text(): string {
    switch (this.type) {
      // case WalletActionTypeEnum.receive:
      //   return 'Receive';
      // case WalletActionTypeEnum.buy:
      //   return 'Buy';
      case WalletActionTypeEnum.send:
        return 'Send';
      case WalletActionTypeEnum.swap:
        return 'Swap';
    }
  }

  get icon() {
    switch (this.type) {
      // case WalletActionTypeEnum.receive:
      //   return '';
      // case WalletActionTypeEnum.buy:
      //   return '';
      case WalletActionTypeEnum.send:
        return 'top';
      case WalletActionTypeEnum.swap:
        return 'swap';
    }
  }
}

// TODO: it will be great to use symbol instead of pubkey. and in all subroutes too
@singleton()
export class WalletDetailViewModel extends ViewModel {
  pubkey: string | null;

  wallet: Wallet | null;

  solanaPubkey: string;

  network: string;

  get walletActions(): WalletActionType[] {
    const wallet = this.wallet;
    if (!wallet) {
      return [];
    }

    if (wallet.isNativeSOL || wallet.token.symbol === 'USDC') {
      return [
        // WalletActionType.buy,
        // WalletActionType.receive,
        WalletActionType.send,
        WalletActionType.swap,
      ];
    }

    return [
      // WalletActionType.receive,
      WalletActionType.send,
      WalletActionType.swap,
    ];
  }

  constructor(
    private _walletsRepository: WalletsRepository,
    private _locationService: LocationService, // private _analyticsManager: AnalyticsManager,
    private _modalService: ModalService,
    private _notificationService: NotificationService,
    _walletModel: WalletModel,
  ) {
    super();

    this.pubkey = null;
    this.wallet = null;
    this.solanaPubkey = _walletModel.publicKey;
    this.network = _walletModel.network;

    makeObservable(this, {
      pubkey: observable,

      wallet: observable,
      walletActions: computed,
    });
  }

  protected override setDefaults(): void {
    this.pubkey = null;
    this.wallet = null;
  }

  protected override onInitialize(): void {
    this._bind();
  }

  protected override afterReactionsRemoved(): void {}

  // Bind subjects
  private _bind(): void {
    // @web: listen to changes in url
    this.addReaction(
      reaction(
        () => this._locationService.getParams<{ pubkey?: string }>('/wallet/:pubkey').pubkey,
        (pubkey) => {
          if (pubkey) {
            this.pubkey = pubkey;
          }
        },
        {
          fireImmediately: true,
        },
      ),
    );

    this.addReaction(
      reaction(
        () => ({ wallets: this._walletsRepository.dataObservable, pubkey: this.pubkey }),
        ({ wallets, pubkey }) => {
          const wallet = wallets?.find((w) => w.pubkey === pubkey);
          if (wallet) {
            this.wallet = wallet;
          }
        },
        {
          fireImmediately: true,
        },
      ),
    );
  }

  private _sendTokens(): void {
    const wallet = this.wallet;
    if (!wallet) {
      return;
    }
    this._locationService.push(`/send/${wallet.pubkey}`);
  }

  // private _buyTokens(): void {
  //   const symbol = this.wallet?.token.symbol;
  //   let token = CryptoCurrency.sol;
  //   if (symbol === 'SOL') {
  //     token = CryptoCurrency.sol;
  //   }
  //
  //   if (symbol === 'USDC') {
  //     token = CryptoCurrency.usdc;
  //   }
  //   this._locationService.push(`/buy/${token.symbol}`);
  // }
  //
  // private _receiveTokens(): void {
  //   this._locationService.push(`/receive`);
  // }

  private _swapTokens(): void {
    const wallet = this.wallet;
    if (!wallet) {
      return;
    }
    this._locationService.push(`/swap/${wallet.pubkey}`);
  }

  start(action: WalletActionType): void {
    switch (action.type) {
      // case WalletActionTypeEnum.receive:
      //   this._receiveTokens();
      //   break;
      // case WalletActionTypeEnum.buy:
      //   this._buyTokens();
      //   break;
      case WalletActionTypeEnum.send:
        this._sendTokens();
        break;
      case WalletActionTypeEnum.swap:
        this._swapTokens();
        break;
    }
  }

  showTransaction(transaction: ParsedTransaction): void {
    this._modalService.openModal<void, TransactionModalProps>(ModalType.SHOW_MODAL_TRANSACTION, {
      transaction,
    });
  }

  // @web
  copyString(value: string, onSuccess: () => void, onError: (error: Error) => void): void {
    void copyToClipboardString(
      value,
      () => {
        this._notificationService.info('Address copied!');
        onSuccess();
      },
      onError,
    );
  }

  copyQRCode(
    qrElement: HTMLCanvasElement,
    onSuccess: () => void,
    onError: (error: Error) => void,
  ): void {
    void copyToClipboardImage(
      qrElement,
      () => {
        this._notificationService.info('QR Code copied!');
        onSuccess();
      },
      onError,
    );
  }
}
