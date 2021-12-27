import type { ValueOf } from '@p2p-wallet-web/core';

import type { APPEARANCE } from 'app/contexts';

export type MainSettings = {
  // Main
  currency: string;
  appearance: ValueOf<typeof APPEARANCE>;
  isZeroBalancesHidden: boolean;
  useFreeTransactions: boolean;

  // Other
  usernameBannerHiddenByUser: boolean;
};

export type TokenAccountsSettings = {
  hiddenTokenAccounts: string[];
  forceShowTokenAccounts: string[];
};
