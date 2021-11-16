import { TokenAccount } from 'api/token/TokenAccount';

export const sortByRules = (rates: { [pair: string]: number }) => (
  a: TokenAccount,
  b: TokenAccount,
) => {
  if (a.mint.symbol === 'SOL' || b.mint.symbol === 'SOL') {
    return a.mint.symbol === 'SOL' ? -1 : 1;
  }

  if (!a.mint.symbol || !b.mint.symbol) {
    return !a.mint.symbol ? 1 : -1;
  }

  const aBalance = a.mint.toMajorDenomination(a.balance);
  const bBalance = b.mint.toMajorDenomination(b.balance);

  if (a.mint.symbol && b.mint.symbol) {
    const aRateSymbol = a.mint.symbol.toUpperCase();
    const bRateSymbol = b.mint.symbol.toUpperCase();

    if (rates[aRateSymbol] && rates[bRateSymbol]) {
      const aUSDBalance = aBalance.times(rates[aRateSymbol]);
      const bUSDBalance = bBalance.times(rates[bRateSymbol]);

      if (!aUSDBalance.eq(bUSDBalance)) {
        return aUSDBalance.gt(bUSDBalance) ? -1 : 1;
      }
    }

    if (rates[aRateSymbol] && !rates[bRateSymbol]) {
      return -1;
    }

    if (!rates[aRateSymbol] && rates[bRateSymbol]) {
      return 1;
    }
  }

  if (!aBalance.eq(bBalance)) {
    return aBalance.gt(bBalance) ? -1 : 1;
  }

  if (a.mint.symbol && b.mint.symbol && a.mint.symbol !== b.mint.symbol) {
    return a.mint.symbol < b.mint.symbol ? -1 : 1;
  }

  return a.mint.address < b.mint.address ? -1 : 1;
};
