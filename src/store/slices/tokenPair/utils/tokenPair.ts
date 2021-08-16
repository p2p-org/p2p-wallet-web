import { eqProps, find, indexOf, update } from 'ramda';

import { Pool, SerializablePool } from 'api/pool/Pool';
import { SerializableToken, Token } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { SYSTEM_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { RootState } from 'store/rootReducer';
import { HasEqual, TokenPairState } from 'utils/types';

export const matchesPool = (firstToken: Token, secondToken: Token) => (pool: Pool): boolean =>
  pool.matchesTokens(firstToken, secondToken);

export const selectPoolForTokenPair = (
  availablePools: Array<SerializablePool>,
  serializedFirstToken?: SerializableToken,
  serializedSecondToken?: SerializableToken,
): SerializablePool | undefined => {
  if (!serializedFirstToken || !serializedSecondToken) {
    return;
  }

  const firstToken = Token.from(serializedFirstToken);
  const secondToken = Token.from(serializedSecondToken);

  const pools = availablePools.map((pool) => Pool.from(pool));
  const foundPool = pools.find(matchesPool(firstToken, secondToken));
  return foundPool && foundPool.serialize();
};

export const getToAmount = (
  amount: number,
  serializableToken?: SerializableToken,
  serializablePool?: SerializablePool,
): number => {
  if (!amount || !serializablePool || !serializableToken) {
    return 0;
  }

  const pool = Pool.from(serializablePool);
  const firstToken = Token.from(serializableToken);
  return pool.calculateAmountInOtherToken(firstToken, amount, false);
};

export const getSortedTokenAccountsByHighestBalance = (
  token: Token,
  tokenAccounts: Array<TokenAccount>,
  excludeZeroBalance: boolean,
): Array<TokenAccount> =>
  tokenAccounts
    .filter(
      (tokenAccount) =>
        tokenAccount.mint.equals(token) && (excludeZeroBalance ? tokenAccount.balance.gt(0) : true),
    )
    .sort((a, b) => b.balance.cmp(a.balance));

export const syncTokenAccount = (
  tokenAccounts: Array<SerializableTokenAccount>,
  tokenAccount?: SerializableTokenAccount,
): SerializableTokenAccount | undefined =>
  tokenAccount &&
  find(
    // use eqProps here because we are comparing SerializableTokenAccounts,
    // which have no equals() function
    eqProps('address', tokenAccount),
    tokenAccounts,
  );

export const syncTokenAccounts = (
  tokenPairState: TokenPairState,
  tokenAccounts: Array<SerializableTokenAccount>,
): TokenPairState => {
  const tokenAccountsWithWSOL = tokenAccounts.map((tokenAccount) => {
    // Change SOL to WSOL in token pair
    if (tokenAccount?.mint.address === SYSTEM_PROGRAM_ID.toBase58()) {
      return {
        ...tokenAccount,
        mint: {
          ...tokenAccount.mint,
          symbol: 'SOL',
          address: WRAPPED_SOL_MINT.toBase58(),
          isSimulated: true,
        },
      };
    }

    return tokenAccount;
  });

  return {
    ...tokenPairState,
    tokenAccounts: tokenAccountsWithWSOL,
    firstTokenAccount: syncTokenAccount(tokenAccountsWithWSOL, tokenPairState.firstTokenAccount),
    secondTokenAccount: syncTokenAccount(tokenAccountsWithWSOL, tokenPairState.secondTokenAccount),
    poolTokenAccount: syncTokenAccount(tokenAccountsWithWSOL, tokenPairState.poolTokenAccount),
  };
};

export const syncPools = (
  tokenPairState: TokenPairState,
  availablePools: Array<SerializablePool>,
): TokenPairState => ({
  ...tokenPairState,
  availablePools,
  selectedPool:
    tokenPairState.selectedPool &&
    find(eqProps('address', tokenPairState.selectedPool), tokenPairState.availablePools),
});

/**
 * Given an entity and an array of entities
 * Find the location of the entity in the array, and replace it.
 * This only works with entities with equals() methods, whose properties
 * can change, without changing the equals result.
 * @param entity
 * @param array
 */
export const updateEntityArray = <T extends HasEqual<T>>(entity: T, array: Array<T>): Array<T> =>
  update(indexOf(entity, array), entity, array);

export const selectTokenAccount = (
  token?: Token,
  tokenAccounts?: Array<TokenAccount>,
  excludeZeroBalance = true,
): TokenAccount | undefined => {
  if (!token || !tokenAccounts) {
    return;
  }

  // fetch the pool token account with the highest balance that matches this token
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    token,
    tokenAccounts,
    excludeZeroBalance,
  );

  if (sortedTokenAccounts.length > 0) {
    return sortedTokenAccounts[0];
  }
};

// export const getPoolTokenAccount = (
//   pool: Pool,
//   tokenAccounts: Array<TokenAccount>,
// ): TokenAccount | undefined => {
//   // fetch the pool token account with the highest balance that matches this pool
//   const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
//     pool.poolToken,
//     tokenAccounts,
//     true,
//   );
//
//   return head(sortedTokenAccounts);
// };

export const tokenPairSelector = (
  state: RootState,
): {
  firstAmount: number;
  secondAmount: number;
  firstToken?: Token;
  secondToken?: Token;
  firstTokenAccount?: TokenAccount;
  secondTokenAccount?: TokenAccount;
  selectedPool?: Pool;
  tokenAccounts: Array<TokenAccount>;
  availablePools: Array<Pool>;
  poolTokenAccount?: TokenAccount;
  slippage?: number;
} => ({
  ...state.tokenPair,
  firstAmount: state.tokenPair.firstAmount,
  secondAmount: state.tokenPair.secondAmount,
  firstToken: state.tokenPair.firstToken && Token.from(state.tokenPair.firstToken),
  secondToken: state.tokenPair.secondToken && Token.from(state.tokenPair.secondToken),
  firstTokenAccount:
    state.tokenPair.firstTokenAccount && TokenAccount.from(state.tokenPair.firstTokenAccount),
  secondTokenAccount:
    state.tokenPair.secondTokenAccount && TokenAccount.from(state.tokenPair.secondTokenAccount),
  selectedPool: state.tokenPair.selectedPool && Pool.from(state.tokenPair.selectedPool),
  tokenAccounts: state.tokenPair.tokenAccounts.map((account) => TokenAccount.from(account)),
  availablePools: state.tokenPair.availablePools.map((pool) => Pool.from(pool)),
  poolTokenAccount:
    state.tokenPair.poolTokenAccount && TokenAccount.from(state.tokenPair.poolTokenAccount),
  slippage: state.tokenPair.slippage,
});
