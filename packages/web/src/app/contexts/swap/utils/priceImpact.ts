import type Decimal from 'decimal.js';

export function displayPriceImpact(priceImpact: Decimal) {
  return priceImpact.lessThan(0.1) ? '<0.1%' : `${priceImpact.toSignificantDigits(2).toString()}%`;
}
