import BN from 'bn.js';
import { Decimal } from 'decimal.js';

import type { Token } from 'api/token/Token';
import type { TokenAccount } from 'api/token/TokenAccount';

export const toDecimal = (num: number | BN | Decimal): Decimal => new Decimal(`${num}`);
export const toBN = (num: number | Decimal): BN => new BN(`${num}`);

// Converts a token amount in minor denomination to its major denomination for display
// e.g. 100 cents to "1.00"
export const minorAmountToMajor = (minorAmount: number | BN | Decimal, token: Token): Decimal =>
  toDecimal(minorAmount)
    .div(10 ** token.decimals)
    .toDecimalPlaces(token.decimals);

// Converts a token amount in major denomination to its minor denomination for storage
// e.g. "1.00" to 100
export const majorAmountToMinor = (majorAmount: Decimal | number, token: Token): Decimal =>
  new Decimal(majorAmount).mul(10 ** token.decimals).round();

export const formatValueWithDecimals = (value: string, decimals: number): string =>
  `${value.slice(0, Math.max(0, value.length - decimals))}.${value.slice(
    Math.max(0, value.length - decimals),
  )}`;

export const formatAccountBalance = (tokenAccount: TokenAccount): string =>
  tokenAccount.mint.toMajorDenomination(tokenAccount.balance).toFixed();

export const formatBalance = (amount: number, decimals: number): string =>
  toDecimal(amount)
    .div(10 ** decimals)
    .toDecimalPlaces(decimals)
    .toFixed();
