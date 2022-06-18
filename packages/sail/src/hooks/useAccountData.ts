import { useMemo } from "react";

import type { PublicKey } from "@solana/web3.js";

import type { AccountDatum } from "../internal";
import { useAccountsData } from "./useAccountsData";

export const useAccountData = (
  key?: PublicKey | null
): { loading: boolean; data: AccountDatum } => {
  const theKey = useMemo(() => [key], [key]);
  const [data] = useAccountsData(theKey);
  return {
    loading: key !== undefined && data === undefined,
    data,
  };
};
