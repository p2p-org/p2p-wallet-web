import type { ParsedAccountDatum } from '@p2p-wallet-web/sail';
import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../../../models';

export const parseTokenAccountsInternal = ({
  accountsData,
  sol,
  derivableTokenAccountKeys,
}: {
  accountsData: ParsedAccountDatum<TokenAmount>[];
  sol: Token;
  derivableTokenAccountKeys: (PublicKey | null)[];
}): readonly (TokenAccount | undefined)[] => {
  return accountsData.map((datum, i) => {
    const derivableTokenAccountKey = derivableTokenAccountKeys[i];
    if (!derivableTokenAccountKey) {
      return undefined;
    }

    const parsed = datum ? datum.accountInfo.data : datum;

    try {
      return {
        key: derivableTokenAccountKey,
        loading: datum === undefined,
        mint: parsed?.token.mintAccount,
        balance: parsed ? parsed : new TokenAmount(sol, 0),
        isInitialized: !!datum,
      };
    } catch (e) {
      console.warn(`Error parsing ATA ${datum?.accountId.toString() ?? '(unknown)'}`, e);
      return undefined;
    }
  });
};
