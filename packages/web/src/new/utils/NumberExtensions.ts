import BN from 'bn.js';

export function convertToBalance(value: BN, decimals: number) {
  const divisor = new BN(10).pow(new BN(decimals));
  const quotient = value.div(divisor);
  const remainder = value.mod(divisor);
  return quotient.toNumber() + remainder.toNumber() / divisor.toNumber();
}
