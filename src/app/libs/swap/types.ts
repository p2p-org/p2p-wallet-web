import { Market } from '@project-serum/serum';
import { ConfirmOptions, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

// Side rust enum used for the program's RPC API.
export type SideEnum = any;

export type ExchangeRate = {
  rate: BN;
  fromDecimals: number;
  quoteDecimals: number;
  strict: boolean;
};

/**
 * Parameters to perform a swap.
 */
export type SwapParams = {
  /**
   * Token mint to swap from.
   */
  fromMint: PublicKey;

  /**
   * Token mint to swap to.
   */
  toMint: PublicKey;

  /**
   * Wallet for `fromMint`. If not provided, uses an associated token address
   * for the configured provider.
   */
  fromWallet?: PublicKey;

  /**
   * Wallet for `toMint`. If not provided, an associated token account will
   * be created for the configured provider.
   */
  toWallet?: PublicKey;

  /**
   * Token mint used as the quote currency for a transitive swap, i.e., the
   * connecting currency.
   */
  quoteMint: PublicKey;

  /**
   * Wallet of the quote currency to use in a transitive swap. Should be either
   * a USDC or USDT wallet. If not provided an associated token account will
   * be created for the configured provider.
   */
  quoteWallet?: PublicKey;

  /**
   * Market client for the first leg of the swap. Can be given to prevent
   * the client from making unnecessary network requests.
   */
  fromMarket: Market;

  /**
   * Market client for the second leg of the swap. Can be given to prevent
   * the client from making unnecessary network requests.
   */
  toMarket?: Market;

  /**
   * Open orders account for the first leg of the swap. If not given, an
   * open orders account will be created.
   */
  fromOpenOrders?: PublicKey;

  /**
   * Open orders account for the second leg of the swap. If not given, an
   * open orders account will be created.
   */
  toOpenOrders?: PublicKey;

  /**
   * Amount of `fromMint` to swap in exchange for `toMint`.
   */
  amount: BN;

  /**
   * The minimum rate used to calculate the number of tokens one
   * should receive for the swap. This is a safety mechanism to prevent one
   * from performing an unexpecteed trade.
   */
  minExchangeRate: ExchangeRate;

  /**
   * Token account to receive the Serum referral fee. The mint must be in the
   * quote currency of the trade (USDC or USDT).
   */
  referral?: PublicKey;

  /**
   * RPC options. If not given the options on the program's provider are used.
   */
  options?: ConfirmOptions;

  /**
   * True if all new open orders accounts should be automatically closed.
   * Currently disabled.
   */
  close?: boolean;
};
