import { Decimal } from 'decimal.js';

import { Token } from 'api/token/Token';

/**
 * Calculates the ratio between two token amounts of varying currencies using integer arithmetic
 *
 * Ratio(a, b) = (a / b) * 10^(decimals b - decimals a)
 */
export const amountRatio = (
  tokenA: Token,
  minorAmountA: number | Decimal,
  tokenB: Token,
  minorAmountB: number | Decimal,
): Decimal => {
  const exponent = tokenB.decimals - tokenA.decimals;

  const a = new Decimal(minorAmountA);
  const b = new Decimal(minorAmountB);

  const expo = new Decimal(10).pow(exponent);
  return a.mul(expo).div(b);
};
