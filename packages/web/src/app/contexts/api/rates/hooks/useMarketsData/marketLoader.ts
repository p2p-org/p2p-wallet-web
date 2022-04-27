import DataLoader from 'dataloader';
import { mergeAll, splitEvery } from 'ramda';

import type { Market, OrderbooksCoinGeckoResponse } from '../../';
import { BASE_CURRENCY, COIN_GECKO_API_URL } from '../../constants';

const CHUNK_AMOUNT = 50;
const BATCH_SCHEDULE_MILLISECONDS = 500;

async function batchFunction(coingeckoIds: readonly string[]): Promise<(Market | null)[]> {
  //console.log(`Fetching markets: ${coingeckoIds.join(', ')}`);

  const chunks = splitEvery(CHUNK_AMOUNT, coingeckoIds);

  const marketsChunked = await Promise.all(
    chunks.map(async (chunk) => {
      const path = `${COIN_GECKO_API_URL}/simple/price`.concat(
        // const path = `http://1.2.3.4/simple/price`.concat(
        `?ids=${chunk.join(',')}&vs_currencies=${BASE_CURRENCY}`,
      );

      const res = await fetch(path);

      if (!res.ok) {
        throw new Error('getRatesMarkets something wrong');
      }

      return (await res.json()) as OrderbooksCoinGeckoResponse;
    }),
  );

  const markets = mergeAll(marketsChunked);

  // map over ids array and pick the characters in order
  // null indicates not found
  //console.log(markets);
  return coingeckoIds.map((id) => markets?.[id.toLowerCase()]?.[BASE_CURRENCY] ?? null);
}

export const marketLoader = new DataLoader<string, Market>(batchFunction, {
  cache: false,
  // aggregate all requests over 500ms
  batchScheduleFn: (callback) => setTimeout(callback, BATCH_SCHEDULE_MILLISECONDS),
});
