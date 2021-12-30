import { useCallback, useState } from 'react';

import { usePubkey } from '@p2p-wallet-web/sail';
import { useConnectionContext } from '@saberhq/use-solana';
import type {
  ConfirmedSignatureInfo,
  PublicKey,
  SignaturesForAddressOptions,
} from '@solana/web3.js';
import { last } from 'ramda';

import { getTransactionSignatures } from '../utils/connection/getTransactions';

export const useTransactionSignatures = (
  _publicKey: PublicKey | string | null | undefined,
  limit = 10,
): [ConfirmedSignatureInfo[], boolean, boolean, (isPaging: boolean) => Promise<void>] => {
  const { connection } = useConnectionContext();
  const publicKey = usePubkey(_publicKey);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [signatures, setSignatures] = useState<ConfirmedSignatureInfo[]>([]);

  const fetchTransactionSignatures = useCallback(
    async (isPaging: boolean | undefined) => {
      if (!publicKey) {
        throw new Error('Missing publickey');
      }

      setIsLoading(true);
      try {
        const options: SignaturesForAddressOptions = {
          limit,
        };

        if (isPaging) {
          options.before = signatures ? last(signatures)?.signature : undefined;
        }

        const newSignatures = await getTransactionSignatures(connection, publicKey, options);

        if (newSignatures.length < limit || newSignatures.length === 0) {
          setIsEnd(true);
        }

        setSignatures(() => [...signatures, ...newSignatures]);
      } finally {
        setIsLoading(false);
      }
    },
    [connection, limit, publicKey, signatures],
  );

  return [signatures, isLoading, isEnd, fetchTransactionSignatures];
};
