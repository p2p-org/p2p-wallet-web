import { useEffect, useState } from 'react';

import { BN } from '@project-serum/anchor';
import type { AccountInfo as TokenAccount } from '@solana/spl-token';
import type { AccountInfo, PublicKey } from '@solana/web3.js';
import assert from 'assert';

import { SOL_MINT } from '../../common/constants';
import { _OWNED_TOKEN_ACCOUNTS_CACHE } from '../common/cache';
import { useToken } from '../index';
import { parseTokenAccountData } from '../utils/getOwnedAssociatedTokenAccounts';

// Null => none exists.
// Undefined => loading.
export function useOwnedTokenAccount(
  mint?: PublicKey,
): { publicKey: PublicKey; account: TokenAccount } | null | undefined {
  const { provider } = useToken();
  const [, setRefresh] = useState(0);

  const tokenAccounts = _OWNED_TOKEN_ACCOUNTS_CACHE.filter(
    (account) => mint && account.account.mint.equals(mint),
  );

  // Take the account with the most tokens in it.
  tokenAccounts.sort((a, b) =>
    a.account.amount > b.account.amount ? -1 : a.account.amount < b.account.amount ? 1 : 0,
  );

  const tokenAccount = tokenAccounts[0];
  const isSol = mint?.equals(SOL_MINT);

  // Stream updates when the balance changes.
  useEffect(() => {
    let listener: number;

    // SOL is special cased since it's not an SPL token.
    if (tokenAccount && isSol) {
      listener = provider.connection.onAccountChange(
        provider.wallet.publicKey,
        (info: { lamports: number }) => {
          const token = {
            amount: new BN(info.lamports),
            mint: SOL_MINT,
          } as TokenAccount;

          if (token.amount !== tokenAccount.account.amount) {
            const index = _OWNED_TOKEN_ACCOUNTS_CACHE.findIndex((account) =>
              account.publicKey.equals(tokenAccount.publicKey),
            );

            assert.ok(index >= 0);

            _OWNED_TOKEN_ACCOUNTS_CACHE[index].account = token;
            setRefresh((r) => r + 1);
          }
        },
      );
    }
    // SPL tokens.
    else if (tokenAccount) {
      listener = provider.connection.onAccountChange(
        tokenAccount.publicKey,
        (info: AccountInfo<Buffer>) => {
          if (info.data.length !== 0) {
            try {
              const token = parseTokenAccountData(info.data);

              if (token.amount !== tokenAccount.account.amount) {
                const index = _OWNED_TOKEN_ACCOUNTS_CACHE.indexOf(tokenAccount);

                assert.ok(index >= 0);

                _OWNED_TOKEN_ACCOUNTS_CACHE[index].account = token;
                setRefresh((r) => r + 1);
              }
            } catch (error) {
              console.log('Failed to decode token AccountInfo');
            }
          }
        },
      );
    }

    return () => {
      if (listener) {
        provider.connection.removeAccountChangeListener(listener);
      }
    };
  }, [provider.wallet.publicKey, provider.connection, tokenAccount, isSol]);

  if (mint === undefined) {
    return undefined;
  }

  if (!isSol && tokenAccounts.length === 0) {
    return null;
  }

  return tokenAccount;
}
