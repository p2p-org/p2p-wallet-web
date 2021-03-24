import { AccountLayout, Token as SPLToken } from '@solana/spl-token';
import { Numberu64, TokenSwap, TokenSwapLayout } from '@solana/spl-token-swap';
import { Account, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { Decimal } from 'decimal.js';
import { complement, isNil } from 'ramda';
import assert from 'ts-invariant';

import { getConnection } from 'api/connection';
import { APIFactory as TokenAPIFactory, TOKEN_PROGRAM_ID, tokenAccountsPrecache } from 'api/token';
import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { getWallet, makeTransaction, sendTransaction } from 'api/wallet';
import { ToastManager } from 'components/common/ToastManager';
import { localSwapProgramId, swapHostFeeAddress } from 'config/constants';
import { WRAPPED_SOL_MINT } from 'constants/solana/bufferLayouts';
import { ExtendedCluster } from 'utils/types';

import { adjustForSlippage, Pool } from './Pool';
import poolConfig from './pool.config';
import { POOL_UPDATED_EVENT, PoolListener, PoolUpdatedEvent } from './PoolListener';

type PoolUpdateCallback = (pool: Pool) => void;

export type PoolCreationParameters = {
  donorAccountA: TokenAccount;
  donorAccountB: TokenAccount;
  feeNumerator: number;
  feeDenominator: number;
  tokenAAmount?: number; // if missing, donate the full amount in donorAccountA
  tokenBAmount?: number; // if missing, donate the full amount in donorAccountB
};

type PoolOperationParameters = {
  // The liquidity pool to use when executing the transaction
  pool: Pool;
  slippage?: number;
};

/**
 * Parameters for a swap transactions
 */
export type SwapParameters = PoolOperationParameters & {
  // The account, owned by the wallet, containing the source tokens
  fromAccount: TokenAccount;
  // The account, owned by the wallet, that will contain the target tokens.
  // If missing, a new account will be created (incurring a fee)
  toAccount?: TokenAccount;

  // The amount of source tokens to swap
  fromAmount: number;
  slippage?: number;
};

export type DepositParameters = PoolOperationParameters & {
  // The user account containing token A
  fromAAccount: TokenAccount;
  // The user account containing token B
  fromBAccount: TokenAccount;
  // The amount to deposit in terms of token A
  fromAAmount: number | Decimal;
  // The user account to receive pool tokens.
  // If missing, a new account will be created (incurring a fee)
  poolTokenAccount?: TokenAccount;
  slippage?: number;
};

export type WithdrawalParameters = PoolOperationParameters & {
  // The user account containing pool tokens
  fromPoolTokenAccount: TokenAccount;
  // The user account to receive token A
  toAAccount?: TokenAccount;
  // The user account to receive token B
  toBAccount?: TokenAccount;
  // The amount to withdraw (in terms of pool tokens)
  fromPoolTokenAmount: number | Decimal;
  slippage?: number;
};

export interface API {
  getPools: () => Promise<Array<Pool>>;
  getPool: (address: PublicKey) => Promise<Pool>;
  updatePool: (pool: Pool) => Promise<Pool>;
  swap: (parameters: SwapParameters) => Promise<string>;
  listenToPoolChanges: (pools: Array<Pool>, callback: PoolUpdateCallback) => PoolListener;
}

const validateSwapParameters = (parameters: SwapParameters): void => {
  // the From amount must be either tokenA or tokenB
  // and, if present, the To amount must be the other one

  const isSwapBetween = (tokenAccount1: TokenAccount, tokenAccount2: TokenAccount) =>
    parameters.fromAccount.sameToken(tokenAccount1) &&
    (!parameters.toAccount || parameters.toAccount.sameToken(tokenAccount2));

  const validAccounts =
    isSwapBetween(parameters.pool.tokenA, parameters.pool.tokenB) ||
    isSwapBetween(parameters.pool.tokenB, parameters.pool.tokenA);

  assert(
    validAccounts,
    `Invalid accounts for fromAccount or toAccount. Must be [${parameters.pool.tokenA.mint}] and [${parameters.pool.tokenB.mint}]`,
  );
};

const isReverseSwap = ({ pool, fromAccount }: Pick<SwapParameters, 'pool' | 'fromAccount'>) =>
  pool.tokenB.sameToken(fromAccount);

export const APIFactory = (cluster: ExtendedCluster): API => {
  const connection = getConnection(cluster);
  const poolConfigForCluster = poolConfig[cluster];

  const swapProgramId = poolConfigForCluster.swapProgramId || localSwapProgramId;
  if (!swapProgramId) {
    throw new Error('No TokenSwap program ID defined');
  }

  console.log(`Swap Program ID ${swapProgramId.toBase58()}.`);

  const tokenAPI = TokenAPIFactory(cluster);

  const parseTokenSwap = async (
    address: PublicKey,
    programId: PublicKey,
    payer: Account,
    data: Buffer,
  ): Promise<TokenSwap> => {
    const tokenSwapData = TokenSwapLayout.decode(data) as {
      isInitialized: boolean;
      tokenPool: string;
      feeAccount: string;
      tokenAccountA: string;
      tokenAccountB: string;
      mintA: string;
      mintB: string;
      tokenProgramId: string;
      tradeFeeNumerator: Buffer;
      tradeFeeDenominator: Buffer;
      ownerTradeFeeNumerator: Buffer;
      ownerTradeFeeDenominator: Buffer;
      ownerWithdrawFeeNumerator: Buffer;
      ownerWithdrawFeeDenominator: Buffer;
      hostFeeNumerator: Buffer;
      hostFeeDenominator: Buffer;
      curveType: number;
    };
    if (!tokenSwapData.isInitialized) {
      throw new Error(`Invalid token swap state`);
    }

    const [authority] = await PublicKey.findProgramAddress([address.toBuffer()], programId);

    const poolToken = new PublicKey(tokenSwapData.tokenPool);
    const feeAccount = new PublicKey(tokenSwapData.feeAccount);
    const tokenAccountA = new PublicKey(tokenSwapData.tokenAccountA);
    const tokenAccountB = new PublicKey(tokenSwapData.tokenAccountB);
    const mintA = new PublicKey(tokenSwapData.mintA);
    const mintB = new PublicKey(tokenSwapData.mintB);
    const tokenProgramId = new PublicKey(tokenSwapData.tokenProgramId);

    const tradeFeeNumerator = Numberu64.fromBuffer(tokenSwapData.tradeFeeNumerator);
    const tradeFeeDenominator = Numberu64.fromBuffer(tokenSwapData.tradeFeeDenominator);
    const ownerTradeFeeNumerator = Numberu64.fromBuffer(tokenSwapData.ownerTradeFeeNumerator);
    const ownerTradeFeeDenominator = Numberu64.fromBuffer(tokenSwapData.ownerTradeFeeDenominator);
    const ownerWithdrawFeeNumerator = Numberu64.fromBuffer(tokenSwapData.ownerWithdrawFeeNumerator);
    const ownerWithdrawFeeDenominator = Numberu64.fromBuffer(
      tokenSwapData.ownerWithdrawFeeDenominator,
    );
    const hostFeeNumerator = Numberu64.fromBuffer(tokenSwapData.hostFeeNumerator);
    const hostFeeDenominator = Numberu64.fromBuffer(tokenSwapData.hostFeeDenominator);
    const { curveType } = tokenSwapData;

    return new TokenSwap(
      connection,
      address,
      programId,
      tokenProgramId,
      poolToken,
      feeAccount,
      authority,
      tokenAccountA,
      tokenAccountB,
      mintA,
      mintB,
      tradeFeeNumerator,
      tradeFeeDenominator,
      ownerTradeFeeNumerator,
      ownerTradeFeeDenominator,
      ownerWithdrawFeeNumerator,
      ownerWithdrawFeeDenominator,
      hostFeeNumerator,
      hostFeeDenominator,
      curveType,
      payer,
    );
  };

  const getPool = async (address: PublicKey, data?: Buffer): Promise<Pool> => {
    const payer = new Account();

    // load the pool
    console.log('swap Address', address.toBase58());
    let swapInfo;
    if (data) {
      swapInfo = await parseTokenSwap(address, swapProgramId, payer, data);
    } else {
      swapInfo = await TokenSwap.loadTokenSwap(connection, address, swapProgramId, payer);
    }

    // load the token account and mint info for tokens A and B
    const tokenAccountAInfo = await tokenAPI.tokenAccountInfo(swapInfo.tokenAccountA);
    const tokenAccountBInfo = await tokenAPI.tokenAccountInfo(swapInfo.tokenAccountB);
    const feeAccountInfo = await tokenAPI.tokenAccountInfo(swapInfo.feeAccount);

    // load the mint info for the pool token
    const poolTokenInfo = await tokenAPI.tokenInfoUncached(swapInfo.poolToken);

    if (!tokenAccountAInfo || !tokenAccountBInfo || !feeAccountInfo) {
      throw new Error('Error collecting pool data');
    }

    const feeRatio =
      swapInfo.tradeFeeNumerator.toNumber() / swapInfo.tradeFeeDenominator.toNumber();

    return new Pool(
      address,
      tokenAccountAInfo,
      tokenAccountBInfo,
      poolTokenInfo,
      feeAccountInfo,
      swapProgramId,
      feeRatio,
      tokenAccountAInfo.lastUpdatedSlot,
    );
  };

  const updatePool = async (pool: Pool): Promise<Pool> => {
    const updatedPool = await getPool(pool.address);

    const previous = pool.getPrevious() || pool;
    updatedPool.setPrevious(previous);

    // We are updating the original pool here, adding the new pool version to its history chain.
    // This is not an ideal solution, for two reasons.
    // 1. it is mutating the state of the input parameter
    // 2. it is adding the new pool to the "history" of the old pool.
    // This is very misleading, if you were to look at the contents of the pool object, the lastUpdatedSlot
    // of the pool would be older than the one in its history!
    //
    // The reason we do this, is that the UI is listening to updates on the original pool object.
    // So the pool object parameter is always the original pool object the listener was added to.
    // To return the updatedPool object with the correct history, we need to store the history somewhere,
    // so we store it on the original pool object.
    // A nicer solution would probably be to store the history only in the redux state, and not inside
    // the objects themselves.
    pool.addToHistory(updatedPool.clone());

    return updatedPool;
  };

  const getPools = async (): Promise<Array<Pool>> => {
    if (!poolConfigForCluster.swapProgramId) {
      console.log(`Current network doesn't have swap program`, cluster);
      return [];
    }

    console.log('Loading pools for cluster', cluster);

    const poolInfos = (
      await connection.getProgramAccounts(poolConfigForCluster.swapProgramId)
    ).filter((item) => item.account.data.length === TokenSwapLayout.span);

    const poolPromises = poolInfos.map((poolInfo) =>
      getPool(poolInfo.pubkey, Buffer.from(poolInfo.account.data)).catch((error: Error) => {
        ToastManager.error(error.message);
        return null;
      }),
    );

    const pools = await Promise.all(poolPromises);

    return pools.filter(complement(isNil)) as Pool[];
  };

  const listenToPoolChanges = (pools: Array<Pool>, callback: PoolUpdateCallback) => {
    const poolListener = new PoolListener(connection);

    pools.map((pool) => poolListener.listenTo(pool));

    poolListener.on(POOL_UPDATED_EVENT, async (event: PoolUpdatedEvent) => {
      const updatedPool = await updatePool(event.pool);
      callback(updatedPool);
    });

    return poolListener;
  };

  const createSwapTransactionInstruction = (
    parameters: Required<SwapParameters> & {
      userTransferAuthority: PublicKey;
      hostFeePublicKey?: PublicKey;
    },
  ): TransactionInstruction => {
    const isReverse = isReverseSwap(parameters);
    const poolIntoAccount = isReverse ? parameters.pool.tokenB : parameters.pool.tokenA;
    const poolFromAccount = isReverse ? parameters.pool.tokenA : parameters.pool.tokenB;

    // handle slippage by setting a minimum expected TO amount
    // the transaction will fail if the received amount is lower than this.
    const minimumToAmountWithoutSlippage = parameters.pool.calculateAmountInOtherToken(
      parameters.fromAccount.mint,
      parameters.fromAmount,
      true,
    );

    const minimumToAmountWithSlippage = adjustForSlippage(
      minimumToAmountWithoutSlippage,
      'down',
      parameters.slippage,
    );

    const authority = parameters.pool.tokenSwapAuthority();

    return TokenSwap.swapInstruction(
      parameters.pool.address,
      authority,
      parameters.userTransferAuthority,
      parameters.fromAccount.address,
      poolIntoAccount.address,
      poolFromAccount.address,
      parameters.toAccount.address,
      parameters.pool.poolToken.address,
      parameters.pool.feeAccount.address,
      parameters.hostFeePublicKey || null,
      swapProgramId,
      TOKEN_PROGRAM_ID,
      parameters.fromAmount,
      minimumToAmountWithSlippage.toNumber(),
    );
  };

  const createWrappedSolAccount = async (
    fromAccount: TokenAccount,
    amount: number,
    payer: PublicKey,
    instructions: TransactionInstruction[],
    cleanupInstructions: TransactionInstruction[],
    signers: Account[],
  ): Promise<TokenAccount> => {
    const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    );

    const newAccount = new Account();

    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: fromAccount.address,
        newAccountPubkey: newAccount.publicKey,
        lamports: amount + accountRentExempt,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    instructions.push(
      SPLToken.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        WRAPPED_SOL_MINT,
        newAccount.publicKey,
        payer,
      ),
    );

    cleanupInstructions.push(
      SPLToken.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        newAccount.publicKey,
        payer,
        payer,
        [],
      ),
    );

    signers.push(newAccount);

    return new TokenAccount(
      fromAccount.mint,
      TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      newAccount.publicKey,
      amount,
    );
  };

  const createAccountByMint = async (
    owner: PublicKey,
    mintToken: Token,
    instructions: TransactionInstruction[],
    cleanupInstructions: TransactionInstruction[],
    signers: Account[],
  ): Promise<TokenAccount> => {
    // if account for owner with same token already exists
    const account = tokenAccountsPrecache
      .toArray()
      .find((tokenAccount) => tokenAccount.matchToken(mintToken) && tokenAccount.matchOwner(owner));

    if (account && !account.mint.address.equals(WRAPPED_SOL_MINT)) {
      return account;
    }

    const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    );

    const newAccount = new Account();

    // creating depositor pool account
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: getWallet().pubkey,
        newAccountPubkey: newAccount.publicKey,
        lamports: accountRentExempt,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    instructions.push(
      SPLToken.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        mintToken.address,
        newAccount.publicKey,
        owner,
      ),
    );

    if (mintToken.address.equals(WRAPPED_SOL_MINT)) {
      cleanupInstructions.push(
        SPLToken.createCloseAccountInstruction(
          TOKEN_PROGRAM_ID,
          newAccount.publicKey,
          getWallet().pubkey,
          getWallet().pubkey,
          [],
        ),
      );
    }

    signers.push(newAccount);

    const newTokenAccount = new TokenAccount(
      mintToken,
      owner,
      TOKEN_PROGRAM_ID,
      newAccount.publicKey,
      0,
    );

    tokenAccountsPrecache.set(newTokenAccount.address.toBase58(), newTokenAccount);

    return newTokenAccount;
  };

  /**
   * Swap tokens via a liquidity pool
   * @param {SwapParameters} parameters
   */
  const swap = async (parameters: SwapParameters): Promise<string> => {
    try {
      validateSwapParameters(parameters);

      const userTransferAuthority = new Account();

      const instructions: TransactionInstruction[] = [];
      const cleanupInstructions: TransactionInstruction[] = [];
      const signers: Account[] = [userTransferAuthority];

      // Create WSOL or Token account
      const fromAccount =
        parameters.fromAccount.mint.address.equals(WRAPPED_SOL_MINT) &&
        parameters.fromAccount.mint.isSimulated
          ? await createWrappedSolAccount(
              parameters.fromAccount,
              parameters.fromAmount,
              getWallet().pubkey,
              instructions,
              cleanupInstructions,
              signers,
            )
          : parameters.fromAccount;

      // get the toAccount from the parameters, or create it if not present
      const isReverse = isReverseSwap(parameters);
      const toToken = isReverse ? parameters.pool.tokenA.mint : parameters.pool.tokenB.mint;

      // Token account or Create Token account
      const toAccount =
        parameters.toAccount && !parameters.toAccount.mint.address.equals(WRAPPED_SOL_MINT)
          ? parameters.toAccount
          : await createAccountByMint(
              getWallet().pubkey,
              toToken,
              instructions,
              cleanupInstructions,
              signers,
            );

      console.log('Executing swap:', parameters);

      // approveInstruction
      instructions.push(
        tokenAPI.approveInstruction(
          fromAccount,
          userTransferAuthority.publicKey,
          parameters.fromAmount,
        ),
      );

      // TODO: host fee
      const feeAccount = swapHostFeeAddress
        ? await createAccountByMint(
            swapHostFeeAddress,
            parameters.pool.poolToken,
            instructions,
            cleanupInstructions,
            signers,
          )
        : null;

      // swapInstruction
      instructions.push(
        createSwapTransactionInstruction({
          fromAccount,
          fromAmount: parameters.fromAmount,
          toAccount,
          hostFeePublicKey: feeAccount?.address,
          slippage: parameters.slippage || 0,
          pool: parameters.pool,
          userTransferAuthority: userTransferAuthority.publicKey,
        }),
      );

      const transaction = await makeTransaction([...instructions, ...cleanupInstructions], signers);
      return sendTransaction(transaction);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    getPools,
    getPool,
    updatePool,
    swap,
    listenToPoolChanges,
  };
};
