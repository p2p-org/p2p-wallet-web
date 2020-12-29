import { PublicKey } from '@solana/web3.js';
import { Decimal } from 'decimal.js';
import assert from 'ts-invariant';

import { toDecimal } from 'utils/amount';
import { Serializable } from 'utils/types';

import { OnChainEntity } from '../OnChainEntity';
import { SerializableToken, Token } from '../token/Token';
import { SerializableTokenAccount, TokenAccount } from '../token/TokenAccount';
import { amountRatio } from './utils/tokePair';

export type SerializablePool = {
  address: string;
  tokenA: SerializableTokenAccount;
  tokenB: SerializableTokenAccount;
  poolToken: SerializableToken;
  feeAccount: SerializableTokenAccount;
  lastUpdatedSlot?: number;
  previous?: SerializablePool;

  programId: string;
  feeRatio: number;
};

export const DEFAULT_SLIPPAGE = 0.01;
type SlippageDirection = 'down' | 'up';

export type TokenAmounts = {
  poolTokenAmount: Decimal;
  tokenAAmount: Decimal;
  tokenBAmount: Decimal;
};

/**
 * Adjust an amount either up or down according to a slippage parameter
 * The default slippage parameter is DEFAULT_SLIPPAGE.
 * e.g. if parameters.slippage is 0.1, the amount is 100, and the direction is
 * "down",
 * the result is 100 * (1 - 0.1) = 90
 *
 * @param amount
 * @param direction
 * @param slippage
 */
export const adjustForSlippage = (
  amount: number | Decimal,
  direction: SlippageDirection,
  slippage = DEFAULT_SLIPPAGE,
): Decimal => {
  const slippageMultiplier = 1 + (direction === 'up' ? slippage : -slippage);

  return toDecimal(amount).mul(slippageMultiplier); // TODO: check its need or not ".floor()"
};

export class Pool extends OnChainEntity<Pool> implements Serializable<SerializablePool> {
  readonly address: PublicKey;

  readonly tokenA: TokenAccount;

  readonly tokenB: TokenAccount;

  readonly poolToken: Token;

  readonly feeAccount: TokenAccount;

  readonly feeRatio: number;

  private programId: PublicKey;

  constructor(
    address: PublicKey,
    tokenA: TokenAccount,
    tokenB: TokenAccount,
    poolToken: Token,
    feeAccount: TokenAccount,
    programId: PublicKey,
    feeRatio: number,
    currentSlot?: number,
    previous?: Pool,
  ) {
    super(currentSlot, previous);

    this.address = address;
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.poolToken = poolToken;
    this.feeAccount = feeAccount;
    this.programId = programId;
    this.feeRatio = feeRatio;
  }

  /**
   * Returns the token B balance divided by the token A balance
   * to give an "amount-free" rate for the pool.
   * As liquidity increases, this approaches the implied rate for any amount.
   * In other words, as liquidity increases, the implied rate is less sensitive
   * to the amount entered, and stabilises to this rate.
   */
  simpleRate(): Decimal {
    return this.tokenA.balance.gt(0)
      ? amountRatio(this.tokenB.mint, this.tokenB.balance, this.tokenA.mint, this.tokenA.balance)
      : toDecimal(0);
  }

  /**
   * Get the liquidity of the pool in terms of token A
   */
  getLiquidity(): Decimal {
    return this.tokenA.balance;
  }

  /**
   * The smallest pool token amount that can be received during deposit
   * or given during withdrawal, depends on the balances and precision
   * of token A and B in the pool.
   */
  getSmallestPoolTokenAmountForWithdrawalOrDeposit(): Decimal {
    const smallestPoolTokenAmountForA = this.getPoolTokenValueOfTokenAAmount(1);
    const smallestPoolTokenAmountForB = this.getPoolTokenValueOfTokenBAmount(1);

    return Decimal.min(smallestPoolTokenAmountForA, smallestPoolTokenAmountForB);
  }

  calculateAmountsWithSlippage(
    poolTokenAmount: number | Decimal,
    direction: SlippageDirection,
    slippage?: number,
  ): TokenAmounts {
    // Calculate the expected amounts for token A & B given a pool token amount and slippage parameters
    const tokenAAmountWithoutSlippage = this.getTokenAValueOfPoolTokenAmount(poolTokenAmount);

    const tokenBAmountWithoutSlippage = this.getTokenBValueOfPoolTokenAmount(poolTokenAmount);

    const tokenALimitWithSlippage = adjustForSlippage(
      tokenAAmountWithoutSlippage,
      direction,
      slippage,
    );

    const tokenBLimitWithSlippage = adjustForSlippage(
      tokenBAmountWithoutSlippage,
      direction,
      slippage,
    );

    return {
      poolTokenAmount: toDecimal(poolTokenAmount),
      tokenAAmount: tokenALimitWithSlippage,
      tokenBAmount: tokenBLimitWithSlippage,
    };
  }

  /**
   * Calculate the associated amount in the other token, for an input token amount.
   * Note, this does not yet take into account slippage, which is not supported by the swap program.
   * It also assumes the swap program uses the Constant Product Function with no smoothing,
   * and that the fees are paid by the recipient, i.e. they are subtracted from the destination amount
   * @param inputToken
   * @param inputAmount
   * @param includeFees
   */
  calculateAmountInOtherToken = (
    inputToken: Token,
    inputAmount: number | Decimal,
    includeFees: boolean,
  ): number => {
    assert(
      inputToken.equals(this.tokenA.mint) || inputToken.equals(this.tokenB.mint),
      'Input token must be either pool token A or B',
    );

    const isReverse = this.tokenB.mint.equals(inputToken);
    const [firstAmountInPool, secondAmountInPool] = isReverse
      ? [this.tokenB.balance, this.tokenA.balance]
      : [this.tokenA.balance, this.tokenB.balance];

    const adjustedAmount = toDecimal(inputAmount);

    const invariant = firstAmountInPool.mul(secondAmountInPool);
    const newFromAmountInPool = firstAmountInPool.add(adjustedAmount);

    const newToAmountInPool = invariant.divToInt(newFromAmountInPool);
    const grossToAmount = secondAmountInPool.sub(newToAmountInPool);
    const fees = includeFees ? grossToAmount.mul(this.feeRatio).floor() : new Decimal(0);

    return grossToAmount.sub(fees).toNumber();
  };

  calculateTokenAAmount = (tokenBAmount: number, includeFees: boolean): number =>
    this.calculateAmountInOtherToken(this.tokenB.mint, tokenBAmount, includeFees);

  calculateTokenBAmount = (tokenAAmount: number, includeFees: boolean): number =>
    this.calculateAmountInOtherToken(this.tokenA.mint, tokenAAmount, includeFees);

  impliedRate(inputToken: Token, inputAmount: number | Decimal): Decimal {
    const inputAmountDecimal = toDecimal(inputAmount);
    const swappedAmount = this.calculateAmountInOtherToken(inputToken, inputAmountDecimal, false);

    return inputAmount > 0
      ? amountRatio(this.otherToken(inputToken), swappedAmount, inputToken, inputAmountDecimal)
      : toDecimal(0);
  }

  impliedFee(inputToken: Token, inputAmount: number): number {
    const swappedAmountWithFee = this.calculateAmountInOtherToken(inputToken, inputAmount, true);

    const swappedAmountWithoutFee = this.calculateAmountInOtherToken(
      inputToken,
      inputAmount,
      false,
    );

    return swappedAmountWithoutFee - swappedAmountWithFee;
  }

  otherToken(token: Token): Token {
    if (this.tokenA.mint.equals(token)) {
      return this.tokenB.mint;
    }

    if (this.tokenB.mint.equals(token)) {
      return this.tokenA.mint;
    }

    throw new Error('');
  }

  /**
   * Calculate the value of the pool tokens in terms of A
   * A = P*A_bal/P_sup
   * where A = the value of the pool tokens in A (the return value)
   * P = the poolTokenAmount
   * A_bal = the balance of token A in the pool
   * P_sup = the total supply of pool tokens
   *
   * The value is rounded down to the nearest integer value in token A
   *
   * @param poolTokenAmount
   */
  getTokenAValueOfPoolTokenAmount(poolTokenAmount: number | Decimal): Decimal {
    // TODO this will change in later versions of the tokenSwap program.
    return toDecimal(poolTokenAmount).mul(this.tokenA.balance).div(this.poolToken.supply).floor();
  }

  /**
   * Calculate the value of the pool tokens in terms of B
   * B = P*B_bal/P_sup
   * where B = the value of the pool tokens in B (the return value)
   * P = the poolTokenAmount
   * B_bal = the balance of token B in the pool
   * P_sup = the total supply of pool tokens
   *
   * @param poolTokenAmount
   */
  getTokenBValueOfPoolTokenAmount(poolTokenAmount: number | Decimal): Decimal {
    return toDecimal(poolTokenAmount).mul(this.tokenB.balance).div(this.poolToken.supply).floor();
  }

  /**
   * This formula is defined in relation to getTokenAValueOfPoolTokenAmount:
   * P = A*P_sup/A_bal
   * @param tokenAAmount
   */
  getPoolTokenValueOfTokenAAmount(tokenAAmount: number | Decimal): Decimal {
    return toDecimal(tokenAAmount).mul(this.poolToken.supply).div(this.tokenA.balance).floor();
  }

  /**
   * This formula is defined in relation to getTokenBValueOfPoolTokenAmount:
   * P = B*P_sup/B_bal
   * @param tokenBAmount
   */
  getPoolTokenValueOfTokenBAmount(tokenBAmount: number | Decimal): Decimal {
    return toDecimal(tokenBAmount).mul(this.poolToken.supply).div(this.tokenB.balance).floor();
  }

  toString(): string {
    return `Pool Address: ${this.address.toBase58()}
    Token A: ${this.tokenA.toString()}
    Token B: ${this.tokenB.toString()}
    Pool Token: ${this.poolToken.toString()} Supply: ${this.poolToken.supply.toNumber()}" 
    `;
  }

  tokenSwapAuthority(): PublicKey {
    // return PublicKey.createProgramAddress(
    //   [this.address.toBuffer(), Buffer.from([this.nonce])],
    //   this.programId,
    // );

    if (!this.poolToken.mintAuthority || !this.feeAccount) {
      throw new Error('Mint doesnt have authority');
    }

    return this.poolToken.mintAuthority;
  }

  matches(firstTokenAccount: TokenAccount, secondTokenAccount: TokenAccount): boolean {
    return (
      (this.tokenA.sameToken(firstTokenAccount) && this.tokenB.sameToken(secondTokenAccount)) ||
      (this.tokenB.sameToken(firstTokenAccount) && this.tokenA.sameToken(secondTokenAccount))
    );
  }

  matchesTokens(firstToken: Token, secondToken: Token): boolean {
    return (
      (this.tokenA.matchToken(firstToken) && this.tokenB.matchToken(secondToken)) ||
      (this.tokenB.matchToken(firstToken) && this.tokenA.matchToken(secondToken))
    );
  }

  equals(other: Pool): boolean {
    return this.address.equals(other.address);
  }

  serialize(): SerializablePool {
    return {
      address: this.address.toBase58(),
      tokenA: this.tokenA.serialize(),
      tokenB: this.tokenB.serialize(),
      poolToken: this.poolToken.serialize(),
      feeAccount: this.feeAccount.serialize(),
      programId: this.programId.toBase58(),
      feeRatio: this.feeRatio,
      lastUpdatedSlot: this.lastUpdatedSlot,
      previous: this.previous?.serialize(),
    };
  }

  static from(serializablePool: SerializablePool): Pool {
    return new Pool(
      new PublicKey(serializablePool.address),
      TokenAccount.from(serializablePool.tokenA),
      TokenAccount.from(serializablePool.tokenB),
      Token.from(serializablePool.poolToken),
      TokenAccount.from(serializablePool.feeAccount),
      new PublicKey(serializablePool.programId),
      serializablePool.feeRatio,
      serializablePool.lastUpdatedSlot,
      serializablePool.previous && Pool.from(serializablePool.previous),
    );
  }

  clone(): Pool {
    return Pool.from(this.serialize());
  }
}
