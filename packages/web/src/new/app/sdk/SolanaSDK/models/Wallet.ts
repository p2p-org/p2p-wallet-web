import { ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';
import { isEmpty } from 'ramda';

import { Defaults } from 'new/services/Defaults';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';

import { Token, TokenAmount } from '../models/SolanaToken';

interface SolanaWalletUserInfo {
  price?: CurrentPrice | null;
  _isHidden: boolean;
  isProcessing?: boolean;
  _customName?: string;
  isBeingCreated?: boolean;
  creatingError?: string;
}

const defaultSolanaWalletUserInfo: SolanaWalletUserInfo = {
  _isHidden: false,
};

export class Wallet {
  // Properties

  pubkey: string;
  lamports: u64 | null;
  token: Token;
  userInfo: object | null = null;

  get isNativeSOL(): boolean {
    return this.token.isNativeSOL;
  }

  constructor({
    pubkey,
    lamports = null,
    token,
  }: {
    pubkey: string;
    lamports?: u64 | null;
    token: Token;
  }) {
    this.pubkey = pubkey;
    this.lamports = lamports;
    this.token = token;
  }

  // Computed properties
  get amount(): TokenAmount {
    return new TokenAmount(this.token, this.lamports ?? ZERO);
  }

  // Fabric methods
  static nativeSolana({ pubkey, lamports }: { pubkey: string; lamports?: u64 }): Wallet {
    return new Wallet({ pubkey, lamports, token: Token.nativeSolana });
  }

  // extensions

  get name(): string {
    if (!this.pubkey) {
      return this.token.symbol;
    }

    return Defaults.walletName[this.pubkey] ?? this.token.symbol;
  }

  get isHidden(): boolean {
    if (this.token.isNativeSOL) {
      return false;
    }

    if (!this.pubkey) {
      return false;
    }

    if (Defaults.hiddenWalletPubkey.includes(this.pubkey)) {
      return true;
    } else if (Defaults.unhiddenWalletPubkey.includes(this.pubkey)) {
      return false;
    } else if (Defaults.hideZeroBalances && this.amount.equalTo(0)) {
      return true;
    }

    return false;
  }

  get price(): CurrentPrice | null {
    return this.getParsedUserInfo().price ?? null;
  }

  set price(newValue) {
    const userInfo = this.getParsedUserInfo();
    userInfo.price = newValue;
    this.userInfo = userInfo;
  }

  get priceInCurrentFiat(): number {
    return this.price?.value ?? 0;
  }

  get amountInCurrentFiat(): number {
    return this.amount.asNumber * this.priceInCurrentFiat;
  }

  updateVisibility() {
    const userInfo = this.getParsedUserInfo();
    userInfo._isHidden = this.isHidden;
    this.userInfo = userInfo;
  }

  getParsedUserInfo(): SolanaWalletUserInfo {
    return (this.userInfo as SolanaWalletUserInfo) ?? { ...defaultSolanaWalletUserInfo };
  }

  static defaultSorter(lhs: Wallet, rhs: Wallet): number {
    // Solana
    if (lhs.isNativeSOL !== rhs.isNativeSOL) {
      return lhs.isNativeSOL ? -1 : 1;
    }

    if (lhs.token.isLiquidity !== rhs.token.isLiquidity) {
      return !lhs.token.isLiquidity ? -1 : 1;
    }

    if (lhs.amountInCurrentFiat !== rhs.amountInCurrentFiat) {
      return lhs.amountInCurrentFiat > rhs.amountInCurrentFiat ? -1 : 1;
    }

    if (isEmpty(lhs.token.symbol) !== isEmpty(rhs.token.symbol)) {
      return !isEmpty(lhs.token.symbol) ? -1 : 1;
    }

    if (!lhs.amount.equalTo(rhs.amount)) {
      return lhs.amount.greaterThan(rhs.amount) ? -1 : 1;
    }

    if (lhs.token.symbol !== rhs.token.symbol) {
      return lhs.token.symbol < rhs.token.symbol ? -1 : 1;
    }

    return lhs.name < rhs.name ? -1 : 1;
  }

  // extensions

  get mintAddress(): string {
    return this.token.address;
  }
}
