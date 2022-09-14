import { action, makeObservable, observable } from 'mobx';
import { delay, inject, singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SupportedTokensViewModel } from 'new/scenes/Main/Receive/SupportedTokens/SupportedTokens.ViewModel';
import type { Token } from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';
import type { ModalPromise } from 'new/services/ModalService';
import { ModalService, ModalType } from 'new/services/ModalService';
import { NotificationService } from 'new/services/NotificationService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

export type TokenTypeName = 'solana' | 'btc';

export class TokenType {
  type: TokenTypeName;

  constructor(type: TokenTypeName) {
    this.type = type;
  }

  static get solana(): TokenType {
    return new TokenType('solana');
  }

  static get btc(): TokenType {
    return new TokenType('btc');
  }

  get name(): string {
    switch (this.type) {
      case 'solana':
        return 'Solana';
      case 'btc':
        return 'Bitcoin';
    }
  }

  get mint(): string {
    switch (this.type) {
      case 'solana':
        return SolanaSDKPublicKey.wrappedSOLMint.toBase58();
      case 'btc':
        return SolanaSDKPublicKey.renBTCMint.toBase58();
    }
  }

  isSolana(): boolean {
    return this.type === 'solana';
  }
}

@singleton()
export class ReceiveViewModel extends ViewModel {
  solanaToken?: Token;
  btcToken?: Token;

  tokenType = TokenType.solana;

  constructor(
    private _notificationService: NotificationService,
    private _walletsRepository: WalletsRepository,
    private _solanaSDK: SolanaService,
    private _modalService: ModalService,
    @inject(delay(() => SupportedTokensViewModel))
    public supportedTokensViewModel: Readonly<SupportedTokensViewModel>,
  ) {
    super();

    makeObservable(this, {
      tokenType: observable,
      solanaToken: observable,
      btcToken: observable,

      switchTokenType: action,
    });

    void this._solanaSDK
      .getToken(TokenType.solana.mint)
      .then(action((token) => (this.solanaToken = token)));

    void this._solanaSDK
      .getToken(TokenType.btc.mint)
      .then(action((token) => (this.btcToken = token)));
  }

  protected override setDefaults() {
    this.tokenType = TokenType.solana;
  }

  protected override onInitialize() {
    this.supportedTokensViewModel.initialize();
  }

  protected override afterReactionsRemoved() {
    this.supportedTokensViewModel.end();
  }

  isRenBtcCreated(): boolean {
    return this._walletsRepository.getWallets().some((wallet) => wallet.token.isRenBTC);
  }

  switchTokenType(tokenType: TokenType): void {
    this.tokenType = tokenType;
    if (tokenType.type === 'btc') {
      // receiveBitcoinViewModel.acceptConditionAndLoadAddress();
    }
  }

  openReceiveBitcoinModal<T>(): ModalPromise<T> {
    return this._modalService.openModal<T, any>(ModalType.SHOW_MODAL_RECEIVE_BITCOIN);
  }
}
