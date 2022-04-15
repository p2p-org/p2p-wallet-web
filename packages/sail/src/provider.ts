import { createContainer } from "unstated-next";

import type { SailError } from ".";
import { useAccountsInternal } from ".";
import type {
  UseAccounts,
  UseAccountsArgs,
  UseHandleTXs,
  UseHandleTXsArgs,
  UseTransactions,
} from "./internal";
import { useHandleTXsInternal, useTransactionsInternal } from "./internal";

export interface UseSail extends UseHandleTXs {
  accounts: UseAccounts;
  transactions: UseTransactions;
  /**
   * Called whenever an error occurs.
   */
  onError: (err: SailError) => void;
}

export type UseSailArgs = Omit<
  UseAccountsArgs & Omit<UseHandleTXsArgs, "refetchMany">,
  "onError"
> & {
  onSailError?: (err: SailError) => void;
};

const defaultOnError = (err: SailError) => console.error(err.message, err);

const useSailInternal = ({
  onSailError = defaultOnError,
  ...args
}: UseSailArgs = {}): UseSail => {
  const accounts = useAccountsInternal({ ...args, onError: onSailError });
  const transactions = useTransactionsInternal({
    ...args,
    onError: onSailError,
  });
  const handleTXs = useHandleTXsInternal({
    ...args,
    onError: onSailError,
    refetchMany: accounts.refetchMany,
  });

  return {
    accounts,
    transactions,
    onError: onSailError,
    ...handleTXs,
  };
};

export const { Provider: SailProvider, useContainer: useSail } =
  createContainer(useSailInternal);
