import { action, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { ReceiveBitcoinViewModel } from 'new/scenes/Main/Receive/ReceiveToken/Bitcoin/ReceiveBitcoin.ViewModel';
import type { Token } from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';
import type { ModalPromise } from 'new/services/ModalService';
import { ModalService, ModalType } from 'new/services/ModalService';
import { TokensRepository, WalletsRepository } from 'new/services/Repositories';
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
    private _walletsRepository: WalletsRepository,
    private _solanaSDK: SolanaService,
    private _tokensRepository: TokensRepository,
    private _modalService: ModalService,
    private _receiveBitcoinViewModel: ReceiveBitcoinViewModel,
  ) {
    super();

    makeObservable(this, {
      tokenType: observable,
      solanaToken: observable,
      btcToken: observable,

      switchTokenType: action,
    });

    void this._tokensRepository
      .getTokenWithMint(TokenType.solana.mint)
      .then(action((token) => (this.solanaToken = token)));

    void this._tokensRepository
      .getTokenWithMint(TokenType.btc.mint)
      .then(action((token) => (this.btcToken = token)));
  }

  protected override setDefaults() {
    this.tokenType = TokenType.solana;
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  isRenBtcCreated(): boolean {
    return this._walletsRepository.getWallets().some((wallet) => wallet.token.isRenBTC);
  }

  switchTokenType(tokenType: TokenType): void {
    this.tokenType = tokenType;
    if (tokenType.type === 'btc') {
      void this._receiveBitcoinViewModel.acceptConditionAndLoadAddress();
    }
  }

  openReceiveBitcoinModal<T>(): ModalPromise<T> {
    return this._modalService.openModal<T, any>(ModalType.SHOW_MODAL_RECEIVE_BITCOIN);
  }
}
