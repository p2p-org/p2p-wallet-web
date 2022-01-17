import { useMemo } from 'react';

import type { ParsedAccountDatum } from '@p2p-wallet-web/sail';
import {
  TOKEN_ACCOUNT_PARSER,
  useNativeAccount,
  useParsedAccountsData,
} from '@p2p-wallet-web/sail';
import type { Token, TokenAccountData } from '@saberhq/token-utils';
import { NATIVE_MINT, TokenAmount } from '@saberhq/token-utils';
import { useConnectedWallet } from '@saberhq/use-solana';
import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../models';
import type { PDAInput } from './useProgramAddresses';
import { PDA, useProgramAddresses } from './useProgramAddresses';

const getATAs = (
  memoTokens: readonly (Token | null | undefined)[],
  owner: PublicKey | undefined,
): (PDAInput<PDA> | null)[] => {
  if (!owner) {
    return [null];
  }

  return memoTokens.map((t): PDAInput | null =>
    t
      ? {
          type: PDA.ATA,
          path: [t.mintAccount, owner],
        }
      : null,
  );
};

export const useUserAssociatedTokenAccounts = (
  tokens: readonly (Token | null | undefined)[],
): readonly (TokenAccount | undefined)[] => {
  const wallet = useConnectedWallet();
  const owner = wallet?.publicKey;

  const memoTokens = useMemo(
    () => tokens,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(tokens.map((tok) => tok?.address))],
  );

  const programAddresses = useMemo(() => getATAs(memoTokens, owner), [memoTokens, owner]);
  const userTokenAccountKeys = useProgramAddresses(programAddresses);

  const accountsData = useParsedAccountsData(userTokenAccountKeys, TOKEN_ACCOUNT_PARSER);

  return useMemo(
    () =>
      parseTokenAccountsInternal({
        accountsData,
        memoTokens,
        userTokenAccountKeys,
      }),
    [accountsData, memoTokens, userTokenAccountKeys],
  );
};

export const useUserAssociatedTokenAccountsWithNativeSOLOverride = (
  tokens: readonly (Token | undefined)[],
): readonly (TokenAccount | undefined)[] => {
  const wallet = useConnectedWallet();
  const { nativeBalance } = useNativeAccount();
  const owner = wallet?.publicKey;

  const memoTokens = useMemo(
    () => tokens,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(tokens.map((tok) => tok?.address))],
  );

  const programAddresses = useMemo(() => getATAs(memoTokens, owner), [memoTokens, owner]);
  const userTokenAccountKeys = useProgramAddresses(programAddresses);

  const accountsData = useParsedAccountsData(userTokenAccountKeys, TOKEN_ACCOUNT_PARSER);

  return useMemo(
    () =>
      parseTokenAccountsInternal({
        accountsData,
        memoTokens,
        userTokenAccountKeys,
        nativeBalance,
      }),
    [accountsData, memoTokens, nativeBalance, userTokenAccountKeys],
  );
};

const parseTokenAccountsInternal = ({
  accountsData,
  memoTokens,
  userTokenAccountKeys,
  nativeBalance = null,
}: {
  accountsData: ParsedAccountDatum<TokenAccountData>[];
  memoTokens: readonly (Token | null | undefined)[];
  userTokenAccountKeys: (PublicKey | null)[];
  nativeBalance?: TokenAmount | null;
}): readonly (TokenAccount | undefined)[] => {
  return accountsData.map((datum, i) => {
    const userTokenAccountKey = userTokenAccountKeys[i];
    if (!userTokenAccountKey) {
      return undefined;
    }

    const token = memoTokens[i];
    if (!token) {
      return undefined;
    }

    const parsed = datum ? datum.accountInfo.data : datum;
    if (nativeBalance && token.mintAccount.equals(NATIVE_MINT)) {
      return {
        key: userTokenAccountKey,
        loading: false,
        balance: nativeBalance,
        isInitialized: true,
      };
    }

    try {
      return {
        key: userTokenAccountKey,
        loading: datum === undefined,
        balance: parsed ? new TokenAmount(token, parsed.amount) : new TokenAmount(token, 0),
        isInitialized: !!datum,
      };
    } catch (e) {
      console.warn(`Error parsing ATA ${datum?.accountId.toString() ?? '(unknown)'}`, e);
      return undefined;
    }
  });
};
