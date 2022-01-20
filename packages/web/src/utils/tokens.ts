import type { TokenAccount } from '@p2p-wallet-web/core';

import type { Markets } from 'app/contexts';

export function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function matchesFilter(str: string, filter: string) {
  return str.toLowerCase().indexOf(filter.toLowerCase().trim()) >= 0;
}

export const sortByRules =
  (rates: Markets) => (a: TokenAccount | undefined, b: TokenAccount | undefined) => {
    if (!a || !b) {
      return !a ? 1 : -1;
    }

    if (a.balance?.token.isRawSOL || b.balance?.token.isRawSOL) {
      return a.balance?.token.isRawSOL ? -1 : 1;
    }

    if (!a.balance || !b.balance) {
      return !a.balance ? 1 : -1;
    }

    const aBalance = a.balance.asNumber;
    const bBalance = b.balance.asNumber;

    const aRateSymbol = a.balance.token.symbol.toUpperCase();
    const bRateSymbol = b.balance.token.symbol.toUpperCase();

    if (rates[aRateSymbol] && rates[bRateSymbol]) {
      const aUSDBalance = aBalance * rates[aRateSymbol]!;
      const bUSDBalance = bBalance * rates[bRateSymbol]!;

      if (aUSDBalance !== bUSDBalance) {
        return aUSDBalance > bUSDBalance ? -1 : 1;
      }
    }

    if (rates[aRateSymbol] && !rates[bRateSymbol]) {
      return -1;
    }

    if (!rates[aRateSymbol] && rates[bRateSymbol]) {
      return 1;
    }

    if (aBalance !== bBalance) {
      return aBalance > bBalance ? -1 : 1;
    }

    if (a.balance.token.symbol !== b.balance.token.symbol) {
      return a.balance.token.symbol < b.balance.token.symbol ? -1 : 1;
    }

    if (!a.balance.token.mintAccount || !b.balance.token.mintAccount) {
      return !a.balance.token.mintAccount ? 1 : -1;
    }

    return a.balance.token.address < b.balance.token.address ? -1 : 1;
  };
