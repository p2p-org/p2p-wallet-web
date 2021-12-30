import { useEffect, useMemo, useState } from 'react';

import { SailTransactionParseError, useSail, useTransactionsData } from '@p2p-wallet-web/sail';
import { zip } from 'ramda';

import type { ParsedTransactionDatum } from '../../models';
import { parser } from '../../models';

/**
 * Parses accounts with the given parser.
 * @param keys
 * @param parser
 * @returns
 */
export const useParsedTransactionsData = (
  keys: (string | null | undefined)[],
): ParsedTransactionDatum[] => {
  const { onError } = useSail();
  const data = useTransactionsData(keys);
  const [parsed, setParsed] = useState<Record<string, ParsedTransactionDatum>>(
    keys.reduce<Record<string, ParsedTransactionDatum>>((acc, k) => {
      if (k) {
        acc[k] = undefined;
      }

      return acc;
    }, {}),
  );

  useEffect(() => {
    setParsed((prevParsed) => {
      const nextParsed = { ...prevParsed };
      zip(keys, data).forEach(([key, datum]) => {
        if (datum) {
          const key = datum.transactionId;
          // const prevValue = prevParsed[key];
          // if (
          //   prevValue &&
          //   prevValue.raw.length === datum.transactionInfo.data.length &&
          //   prevValue.raw.equals(datum.transactionInfo.data)
          // ) {
          //   // preserve referential equality if buffers are equal
          //   return;
          // }
          try {
            const parsed = parser(datum);
            nextParsed[key] = {
              ...datum,
              transactionInfo: {
                ...datum.transactionInfo,
                data: parsed,
              },
              raw: datum.transactionInfo,
            };
          } catch (e) {
            onError(new SailTransactionParseError(e, datum));
            nextParsed[key] = null;
            return;
          }
        }
        if (key && datum === null) {
          nextParsed[key] = null;
        }
      });
      return nextParsed;
    });
  }, [data, keys, onError]);

  return useMemo(() => {
    return keys.map((key) => {
      if (!key) {
        return key as null | undefined;
      }
      return parsed[key];
    });
  }, [keys, parsed]);
};
