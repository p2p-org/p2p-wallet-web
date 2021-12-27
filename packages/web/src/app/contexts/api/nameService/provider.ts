import { useCallback, useEffect, useState } from 'react';

import { useConnectedWallet } from '@p2p-wallet-web/core';
import type { PublicKey } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import { NAME_SERVICE_URL } from './constants';

export type LookupResponse = {
  address: string;
  name: string;
  parent: string;
};

export type ResolveUsernameResponse = {
  parent_name: string;
  owner: string;
  class: string;
  name: string;
};

export interface UseNameService {
  username: string | null | undefined;
  resolveUsername: (name: string) => Promise<ResolveUsernameResponse[]>;
}

const useNameServiceInternal = (): UseNameService => {
  const wallet = useConnectedWallet();
  const publicKey = wallet?.publicKey;

  const [username, setUsername] = useState<string | null | undefined>();

  const lookupName = useCallback(
    async (owner: PublicKey | undefined, controller: AbortController) => {
      if (!owner) {
        setUsername(undefined);
        return;
      }

      try {
        const res = await fetch(`${NAME_SERVICE_URL}/lookup/${owner.toBase58()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('lookup username something wrong');
        }

        const result = (await res.json()) as LookupResponse[];

        if (result.length > 0 && result[0]?.name) {
          setUsername(result[0].name);
          return;
        }

        setUsername(null);
      } catch (error) {
        console.error(error);
        setUsername(null);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void lookupName(publicKey, controller);

    return () => {
      controller.abort();
    };
  }, [lookupName, publicKey]);

  const resolveUsername = useCallback(async (name: string): Promise<ResolveUsernameResponse[]> => {
    if (!name) return [];
    try {
      const res = await fetch(`${NAME_SERVICE_URL}/resolve/${name}`);

      if (res.status === 404) {
        return [];
      }

      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  return {
    username,
    resolveUsername,
  };
};

export const { Provider: NameServiceProvider, useContainer: useNameService } =
  createContainer(useNameServiceInternal);
