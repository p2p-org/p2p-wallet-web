import { deriveAssociatedTokenAddress, ZERO } from '@orca-so/sdk';
import { AccountLayout, u64 } from '@solana/spl-token';
import type { AccountInfo, Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { SetSlot } from 'app/contexts/solana/blockchain';

import type { MintToTokenName } from '../config';
import TokenAccount from '../models/TokenAccount';
import type { UserTokenAccountMap } from '../user';
import { retryRpcResponseAndContext } from './api';
import { u64FromBuffer } from './u64';

export async function isNonATA(
  candidateKey: PublicKey,
  destPubKey: PublicKey,
  tokenMintPubKey: PublicKey,
): Promise<boolean> {
  return !(await deriveAssociatedTokenAddress(destPubKey, tokenMintPubKey)).equals(candidateKey);
}

// copy past from here: https://github.com/solana-labs/oyster-lending/blob/9677c6ffedb70ccd026d7e7bf6cecdb632c3d1fe/src/contexts/accounts.tsx#L667
const deserializeAccount = (data: Buffer) => {
  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64FromBuffer(accountInfo.amount);

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64FromBuffer(accountInfo.delegatedAmount);
  }

  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64FromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }

  return accountInfo;
};

type LoadTokenAccountsReturnValue = {
  tokenAccounts: UserTokenAccountMap;
  hasNonATAs: boolean;
};

export async function loadTokenAccounts(
  connection: Connection,
  slot: number,
  setSlot: SetSlot,
  user: PublicKey,
  tokenProgramId: PublicKey,
  solMint: PublicKey,
  mintToTokenName: MintToTokenName,
): Promise<LoadTokenAccountsReturnValue> {
  const map: UserTokenAccountMap = {};
  let hasNonATAs = false;

  const fetchingUserAccount = retryRpcResponseAndContext(
    () => connection.getAccountInfoAndContext(user),
    slot,
    setSlot,
  ).then((response) => {
    const accountInfo = response.value;

    // If the user's account hasn't been initialized on the blockchain,
    // set balance to 0.
    const lamports = new u64(accountInfo ? accountInfo.lamports : 0);

    // TODO: Fix so that token.account is the SOL address
    map['SOL'] = TokenAccount.createWrappedSolAccount(connection, user, solMint, new u64(lamports));
  });

  const fetchingTokenAccounts = retryRpcResponseAndContext(
    () =>
      connection.getTokenAccountsByOwner(user, {
        programId: tokenProgramId,
      }),
    slot,
    setSlot,
  )
    .then((response) => {
      // Asynchronously check if the token address is an ATA
      return Promise.all(
        response.value.map(
          async (publicKeyAndAccount: { pubkey: PublicKey; account: AccountInfo<any> }) => {
            const { pubkey, account } = publicKeyAndAccount;
            const accountInfo = deserializeAccount(account.data);

            return {
              tokenAddress: pubkey,
              accountInfo,
              isNonATA: await isNonATA(pubkey, user, accountInfo.mint),
            };
          },
        ),
      );
    })
    .then((accounts) => {
      accounts.forEach(({ tokenAddress, accountInfo, isNonATA }) => {
        const tokenAccount = new TokenAccount(connection, tokenAddress, accountInfo);

        const mintAddress = accountInfo.mint.toBase58();
        const tokenName = mintToTokenName[mintAddress] || mintAddress;
        if (!tokenName || tokenName === 'SOL') {
          return;
        }

        if (isNonATA && !tokenAccount.getAmount().eq(ZERO)) {
          hasNonATAs = true;
        }

        if (map[tokenName] && isNonATA) {
          return;
        }

        map[tokenName] = tokenAccount;
      });
    });

  await Promise.all([fetchingUserAccount, fetchingTokenAccounts]);

  return { tokenAccounts: map, hasNonATAs };
}

// returns min sol balance required for a swap
//   returns 0.00004 SOL for 1-step swaps
//   returns 0.003 SOL for 2-step swaps
export function minSolBalanceForSwap(decimals: number, isTwoStep: boolean) {
  if (isTwoStep) {
    return new u64(10).pow(new u64(decimals - 3)).mul(new u64(3));
  }

  return new u64(10).pow(new u64(decimals - 5)).mul(new u64(4));
}
