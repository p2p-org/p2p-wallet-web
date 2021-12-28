import DataLoader from 'dataloader';
import { mergeAll, splitEvery } from 'ramda';

import type { Market, OrderbooksCryptoCompareResponse } from '../../';
import { BASE_CURRENCY, CRYPTO_COMPARE_API_KEY, CRYPTO_COMPARE_API_URL } from '../../constants';

async function batchFunction(symbols: readonly string[]): Promise<(Market | null)[]> {
  console.log(`Fetching markets: ${symbols.join(', ')}`);

  const chunks = splitEvery(50, symbols);

  const marketsChunked = await Promise.all(
    chunks.map(async (chunk) => {
      const path = `${CRYPTO_COMPARE_API_URL}/pricemulti`
        .concat(`?api_key=${CRYPTO_COMPARE_API_KEY}`)
        .concat(`&fsyms=${chunk.join(',')}&tsyms=${BASE_CURRENCY}`);

      const res = await fetch(path);

      if (!res.ok) {
        throw new Error('getRatesMarkets something wrong');
      }

      return (await res.json()) as OrderbooksCryptoCompareResponse;
    }),
  );

  const markets = mergeAll(marketsChunked);

  // map over ids array and pick the characters in order
  // null indicates not found
  return symbols.map((symbol) => markets?.[symbol]?.[BASE_CURRENCY] ?? null);
}

export const marketLoader = new DataLoader<string, Market>(batchFunction, {
  cache: false,
  // aggregate all requests over 500ms
  batchScheduleFn: (callback) => setTimeout(callback, 500),
});
