import type { Network } from '@saberhq/solana-contrib';
import { chainIdToNetwork } from '@saberhq/token-utils';

import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export class TokenList {
  constructor() {}
}

export enum WrappingToken {
  sollet = 'sollet',
  wormhole = 'wormhole',
}

export class Token {
  /**
   * The network that the Token is on.
   */
  readonly network: Network;

  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string | null;
  tags: string[];
  extensions?: TokenExtensions | null;
  private _isNative: boolean;

  constructor({
    chainId,
    address,
    symbol,
    name,
    decimals,
    logoURI,
    tags = [],
    extensions,
    isNative = false,
  }: {
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string | null;
    tags?: string[];
    extensions?: TokenExtensions | null;
    isNative?: boolean;
  }) {
    this.chainId = chainId;
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
    this.logoURI = logoURI;
    this.tags = tags;
    this.extensions = extensions;
    this._isNative = isNative;

    this.network = chainIdToNetwork(chainId);
  }

  get isNative(): boolean {
    return this._isNative;
  }

  static unsupported({
    mint,
    decimals = 0,
    symbol = '',
  }: {
    mint?: string;
    decimals?: number;
    symbol?: string;
  }): Token {
    return new Token({
      chainId: 101,
      address: mint ?? '<undefined>',
      symbol: symbol,
      name: mint ?? '<undefined>',
      decimals: decimals,
      logoURI: null,
      tags: [],
      extensions: null,
    });
  }

  static get nativeSolana(): Token {
    return new Token({
      chainId: 101,
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      tags: [],
      extensions: {
        coingeckoId: 'solana',
      },
      isNative: true,
    });
  }

  static get renBTC(): Token {
    return new Token({
      chainId: 101,
      address: SolanaSDKPublicKey.renBTCMint.toString(),
      symbol: 'renBTC',
      name: 'renBTC',
      decimals: 8,
      logoURI:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5/logo.png',
      extensions: {
        website: 'https://renproject.io/',
        bridgeContract: null,
        assetContract: null,
        address: null,
        explorer: null,
        twitter: null,
        github: null,
        medium: null,
        tgann: null,
        tggroup: null,
        discord: null,
        serumV3Usdt: null,
        serumV3Usdc: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
        coingeckoId: 'renbtc',
        imageUrl: null,
        description: null,
      },
    });
  }

  get wrappedBy(): WrappingToken | null {
    if (this.tags.some((tag) => tag === 'wrapped-sollet')) {
      return WrappingToken.sollet;
    }

    if (this.tags.some((tag) => tag === 'wrapped') && this.tags.some((tag) => tag === 'wormhole')) {
      return WrappingToken.wormhole;
    }

    return null;
  }

  get isLiquidity(): boolean {
    return this.tags.some((tag) => tag === 'lp-token');
  }

  get isUndefined(): boolean {
    return this.symbol === '';
  }

  get isNativeSOL(): boolean {
    return this.symbol === 'SOL' && this.isNative;
  }

  get isRenBTC(): boolean {
    return (
      this.address === SolanaSDKPublicKey.renBTCMint.toString() ||
      this.address === SolanaSDKPublicKey.renBTCMintDevnet.toString()
    );
  }

  equals(other: Token): boolean {
    return tokensEqual(this, other);
  }
}

/**
 * Checks if two tokens are equal.
 * @param a
 * @param b
 * @returns
 */
export const tokensEqual = (a: Token | undefined, b: Token | undefined): boolean =>
  a !== undefined && b !== undefined && a.address === b.address && a.network === b.network;

export interface TokenExtensions {
  website?: string | null;
  bridgeContract?: string | null;
  assetContract?: string | null;
  address?: string | null;
  explorer?: string | null;
  twitter?: string | null;
  github?: string | null;
  medium?: string | null;
  tgann?: string | null;
  tggroup?: string | null;
  discord?: string | null;
  serumV3Usdt?: string | null;
  serumV3Usdc?: string | null;
  coingeckoId?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}
