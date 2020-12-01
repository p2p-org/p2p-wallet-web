import { AccountInfo as TokenAccountInfo, AccountLayout, Token } from '@solana/spl-token';
import { TokenSwap, TokenSwapLayout } from '@solana/spl-token-swap';
import * as web3 from '@solana/web3.js';

import { POOLS_BY_ENTRYPOINT } from 'constants/pools';
import { TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { getPoolsProgramAccountsAsyncAction, mintTestTokenAsyncAction } from 'store/_commands';
import { SOLANA_API } from 'store/_middlewares';
import { ApiSolanaService } from 'store/_middlewares/solana-api/services';
import { PoolInfo } from 'store/_reducers/entities/pools';
import { AppThunk } from 'store/types';

export interface TokenAccount {
  pubkey: web3.PublicKey;
  account: web3.AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export interface LiquidityComponent {
  amount: number;
  account?: TokenAccount;
  mintAddress: string;
}

const toPoolInfo = (item: any, program: web3.PublicKey) => {
  const mint = new web3.PublicKey(item.data.tokenPool);
  return {
    pubkeys: {
      account: item.pubkey,
      program,
      mint,
      holdingMints: [] as web3.PublicKey[],
      holdingAccounts: [item.data.tokenAccountA, item.data.tokenAccountB].map(
        (a) => new web3.PublicKey(a),
      ),
    },
    raw: item,
  } as PoolInfo;
};

export const getPoolsAccounts = (): AppThunk => async (dispatch, getState) => {
  const { entrypoint } = getState().data.blockchain;
  const { swapProgramId } = POOLS_BY_ENTRYPOINT[entrypoint];

  dispatch(getPoolsProgramAccountsAsyncAction.request());
  try {
    const res = await ApiSolanaService.getConnection()?.getProgramAccounts(swapProgramId);

    if (res.error) {
      throw new Error(res.error);
    }

    const result = res
      .filter((item) => item.account.data.length === TokenSwapLayout.span)
      .map((item) => {
        const result = {
          data: undefined as any,
          account: item.account,
          pubkey: item.pubkey,
        };

        result.data = TokenSwapLayout.decode(item.account.data);

        const pool = toPoolInfo(result, swapProgramId);
        pool.pubkeys.feeAccount = new web3.PublicKey(result.data.feeAccount);
        pool.pubkeys.holdingMints = [
          new web3.PublicKey(result.data.mintA),
          new web3.PublicKey(result.data.mintB),
        ] as web3.PublicKey[];

        return pool;
      });

    dispatch(getPoolsProgramAccountsAsyncAction.success(result));
  } catch (error) {
    console.error(error.toString());
    dispatch(getPoolsProgramAccountsAsyncAction.failure(error.toString()));
  }
};

function getWrappedAccount(
  transaction: web3.Transaction,
  cleanupInstructions: web3.TransactionInstruction[],
  toCheck: TokenAccount,
  payer: web3.PublicKey,
  amount: number,
  signers: web3.Account[],
) {
  if (!toCheck.info.isNative) {
    return toCheck.pubkey;
  }

  const account = new web3.Account();

  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: amount,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WRAPPED_SOL_MINT,
      account.publicKey,
      payer,
    ),
  );

  cleanupInstructions.push(
    Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account.publicKey, payer, payer, []),
  );

  signers.push(account);

  return account.publicKey;
}

function createSplAccount(
  transaction: web3.Transaction,
  payer: web3.PublicKey,
  accountRentExempt: number,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
  space: number,
) {
  const account = new web3.Account();

  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: accountRentExempt,
      space,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, account.publicKey, owner),
  );

  return account;
}

function findOrCreateAccountByMint(
  payer: web3.PublicKey,
  owner: web3.PublicKey,
  transaction: web3.Transaction,
  cleanupInstructions: web3.TransactionInstruction[],
  accountRentExempt: number,
  mint: web3.PublicKey, // use to identify same type
  signers: web3.Account[],
  excluded?: Set<string>,
): web3.PublicKey {
  const accountToFind = mint.toBase58();
  const account = getCachedAccount(
    (acc) =>
      acc.info.mint.toBase58() === accountToFind &&
      acc.info.owner.toBase58() === owner.toBase58() &&
      (excluded === undefined || !excluded.has(acc.pubkey.toBase58())),
  );

  const isWrappedSol = accountToFind === WRAPPED_SOL_MINT.toBase58();

  let toAccount: web3.PublicKey;
  if (account && !isWrappedSol) {
    toAccount = account.pubkey;
  } else {
    // creating depositor pool account
    const newToAccount = createSplAccount(
      transaction,
      payer,
      accountRentExempt,
      mint,
      owner,
      AccountLayout.span,
    );

    toAccount = newToAccount.publicKey;
    signers.push(newToAccount);

    if (isWrappedSol) {
      cleanupInstructions.push(
        Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, toAccount, payer, payer, []),
      );
    }
  }

  return toAccount;
}

// Uniswap whitepaper: https://uniswap.org/whitepaper.pdf
// see: https://uniswap.org/docs/v2/advanced-topics/pricing/
// as well as native uniswap v2 oracle: https://uniswap.org/docs/v2/core-concepts/oracles/
export const swap = async (
  connection: web3.Connection,
  wallet: any,
  components: LiquidityComponent[],
  SLIPPAGE: number,
  pool?: PoolInfo,
): AppThunk => async (dispatch, getState) => {
  if (!pool || !components[0].account) {
    // TODO: check auth
    console.info('TODO: notify');
    return;
  }

  const ownerAccount = getState().data.blockchain.account;

  if (!ownerAccount) {
    // TODO: check auth
    console.info('TODO: check auth');
    return;
  }

  const amountIn = components[0].amount; // these two should include slippage
  const minAmountOut = components[1].amount * (1 - SLIPPAGE);

  const holdingA =
    pool.pubkeys.holdingMints[0].toBase58() === components[0].account.info.mint.toBase58()
      ? pool.pubkeys.holdingAccounts[0]
      : pool.pubkeys.holdingAccounts[1];
  const holdingB =
    holdingA === pool.pubkeys.holdingAccounts[0]
      ? pool.pubkeys.holdingAccounts[1]
      : pool.pubkeys.holdingAccounts[0];

  const poolMint = await cache.getMint(connection, pool.pubkeys.mint);

  if (!poolMint.mintAuthority || !pool.pubkeys.feeAccount) {
    throw new Error('Mint doesnt have authority');
  }

  const authority = poolMint.mintAuthority;

  const transaction = new web3.Transaction();
  const cleanupInstructions: web3.TransactionInstruction[] = [];
  const signers: web3.Account[] = [];

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const fromAccount = getWrappedAccount(
    transaction,
    cleanupInstructions,
    components[0].account,
    ownerAccount.publicKey,
    amountIn + accountRentExempt,
    signers,
  );

  const toAccount = findOrCreateAccountByMint(
    ownerAccount.publicKey,
    ownerAccount.publicKey,
    transaction,
    cleanupInstructions,
    accountRentExempt,
    new web3.PublicKey(components[1].mintAddress),
    signers,
  );

  // create approval for transfer transactions
  transaction.add(
    Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      fromAccount,
      authority,
      ownerAccount.publicKey,
      [],
      amountIn,
    ),
  );

  // swap
  transaction.add(
    TokenSwap.swapInstruction(
      pool.pubkeys.account,
      authority,
      fromAccount,
      holdingA,
      holdingB,
      toAccount,
      pool.pubkeys.mint,
      pool.pubkeys.feeAccount,
      null,
      pool.pubkeys.program,
      TOKEN_PROGRAM_ID,
      amountIn,
      minAmountOut,
    ),
  );

  // const tx = await sendTransaction(
  //   connection,
  //   wallet,
  //   instructions.concat(cleanupInstructions),
  //   signers,
  // );

  transaction.add(cleanupInstructions);

  return dispatch({
    [SOLANA_API]: {
      action: mintTestTokenAsyncAction,
      transaction,
      signers,
      options: {
        preflightCommitment: 'single',
      },
    },
  });
};
