import { useEffect, useState } from 'react';

import { getATAAddress } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

export enum PDA {
  ATA = 'ATA',
}

export type PDAInputPaths = {
  [PDA.ATA]: readonly [token: PublicKey, owner: PublicKey];
};

export type PDAInput<K extends PDA = PDA> = {
  type: K;
  path: PDAInputPaths[K];
};

const associationCache: Record<string, PublicKey> = {};

const strategies: {
  [T in PDA]: (path: PDAInputPaths[T]) => Promise<PublicKey>;
} = {
  [PDA.ATA]: async ([mint, owner]) => {
    return await getATAAddress({
      mint,
      owner,
    });
  },
};

const makeCacheKey = ({ type, path }: PDAInput): string =>
  `${type}/${path.map((p) => p.toString()).join(',')}`;

/**
 * Loads and caches program addresses.
 * @param addresses
 * @returns
 */
export const useProgramAddresses = (addresses: (PDAInput | null)[]): (PublicKey | null)[] => {
  const [keys, setKeys] = useState<(PublicKey | null)[]>(
    addresses.map((addr) => {
      if (!addr) {
        return null;
      }
      const cacheKey = makeCacheKey(addr);
      if (associationCache[cacheKey]) {
        return associationCache[cacheKey] ?? null;
      }
      return null;
    }),
  );

  useEffect(() => {
    void (async () => {
      setKeys(
        await Promise.all(
          addresses.map(
            async <K extends PDA>(addr: PDAInput<K> | null): Promise<PublicKey | null> => {
              if (!addr) {
                return null;
              }
              const cacheKey = makeCacheKey(addr);
              if (associationCache[cacheKey]) {
                return associationCache[cacheKey] ?? null;
              }
              const strategy = strategies[addr.type] as (
                path: PDAInputPaths[K],
              ) => Promise<PublicKey>;
              const nextKey = await strategy(addr.path);
              associationCache[cacheKey] = nextKey;
              return nextKey;
            },
          ),
        ),
      );
    })();
  }, [addresses]);

  return keys;
};
