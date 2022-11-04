import { ZERO } from '@orca-so/sdk';
import { makeAutoObservable } from 'mobx';
import { isEmpty } from 'ramda';

import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';

import type { Lamports } from './Models';
import { Token } from './SolanaToken';

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

  pubkey?: string | null;
  lamports?: Lamports | null;
  token: Token;
  userInfo: object | null = null;
  supply?: number | null;

  get isNativeSOL(): boolean {
    return this.token.isNativeSOL;
  }

  constructor({
    pubkey = null,
    lamports = null,
    supply = null,
    token,
  }: {
    pubkey?: string | null;
    lamports?: Lamports | null;
    supply?: number | null;
    token: Token;
  }) {
    this.pubkey = pubkey;
    this.lamports = lamports;
    this.supply = supply;
    this.token = token;

    makeAutoObservable(this);
  }

  // Computed properties
  get amount(): number {
    return this.lamports ? convertToBalance(this.lamports, this.token.decimals) : 0;
  }

  // Fabric methods
  static nativeSolana({
    pubkey = null,
    lamports = null,
  }: {
    pubkey?: string | null;
    lamports?: Lamports | null;
  }): Wallet {
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
    } else if (Defaults.hideZeroBalances && this.amount === 0) {
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
    return this.amount * this.priceInCurrentFiat;
  }

  get shortAddress() {
    return `${this.pubkey?.slice(0, 4)}…${this.pubkey?.slice(-4)}`;
  }

  updateVisibility() {
    const userInfo = this.getParsedUserInfo();
    userInfo._isHidden = this.isHidden;
    this.userInfo = userInfo;
  }

  getParsedUserInfo(): SolanaWalletUserInfo {
    return (this.userInfo as SolanaWalletUserInfo) ?? { ...defaultSolanaWalletUserInfo };
  }

  increaseBalance(diffInLamports: Lamports): void {
    const currentBalance = this.lamports ?? ZERO;
    this.lamports = currentBalance.add(diffInLamports);
  }

  decreaseBalance(diffInLamports: Lamports): void {
    const currentBalance = this.lamports ?? ZERO;
    if (currentBalance.gte(diffInLamports)) {
      this.lamports = currentBalance.sub(diffInLamports);
    } else {
      this.lamports = ZERO;
    }
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

    if (lhs.amount !== rhs.amount) {
      return lhs.amount > rhs.amount ? -1 : 1;
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
