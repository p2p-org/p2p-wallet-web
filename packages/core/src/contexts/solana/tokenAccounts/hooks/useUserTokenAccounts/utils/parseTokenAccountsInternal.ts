import type { AccountDatum } from '@p2p-wallet-web/sail';
import { TOKEN_ACCOUNT_PARSER } from '@p2p-wallet-web/sail';
import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

import { SYSTEM_PROGRAM_ID } from '../../../../../../constants/publicKeys';
import type { TokenMap } from '../../../../../../hooks';
import type { TokenAccount } from '../../../models';

export const parseTokenAccountsInternal = ({
  accountsData,
  tokenMap,
  userTokenAccountKeys,
  sol,
}: {
  accountsData: readonly AccountDatum[];
  tokenMap: TokenMap;
  userTokenAccountKeys: (PublicKey | null)[];
  sol: Token;
}): readonly (TokenAccount | undefined)[] => {
  return accountsData.map((datum, i) => {
    const userTokenAccountKey = userTokenAccountKeys[i];
    if (!userTokenAccountKey) {
      return undefined;
    }

    if (datum?.accountInfo.owner.equals(SYSTEM_PROGRAM_ID)) {
      return {
        key: userTokenAccountKey,
        loading: datum === undefined,
        mint: sol.mintAccount,
        balance: datum ? new TokenAmount(sol, datum.accountInfo.lamports) : undefined,
        isInitialized: !!datum,
      };
    }

    const parsed = datum ? TOKEN_ACCOUNT_PARSER(datum) : datum;

    const token = parsed ? tokenMap[parsed.mint.toBase58()] : undefined;
    if (!token) {
      return {
        key: userTokenAccountKey,
        loading: datum === undefined,
        mint: parsed?.mint,
        balance: undefined,
        isInitialized: !!datum,
      };
    }

    try {
      return {
        key: userTokenAccountKey,
        loading: datum === undefined,
        mint: parsed?.mint,
        balance: parsed ? new TokenAmount(token, parsed.amount) : new TokenAmount(token, 0),
        isInitialized: !!datum,
      };
    } catch (e) {
      console.warn(`Error parsing ${datum?.accountId.toString() ?? '(unknown)'}`, e);
      return undefined;
    }
  });
};
