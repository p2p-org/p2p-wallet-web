import { createContainer } from "unstated-next";

import type { SailError } from ".";
import type {
  UseAccounts,
  UseAccountsArgs,
} from "./internal/accounts/useAccountsInternal";
import { useAccountsInternal } from "./internal/accounts/useAccountsInternal";
import type {
  UseHandleTXsArgs,
  UseHandleTXsInternal,
} from "./internal/tx/useHandleTXsInternal";
import { useHandleTXsInternal } from "./internal/tx/useHandleTXsInternal";

export interface UseSail extends UseAccounts, UseHandleTXsInternal {}

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
  const handleTXs = useHandleTXsInternal({
    ...args,
    onError: onSailError,
    refetchMany: accounts.refetchMany,
  });

  return {
    ...accounts,
    ...handleTXs,
  };
};

export const { Provider: SailProvider, useContainer: useSail } =
  createContainer(useSailInternal);
