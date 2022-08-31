import { ONE, ZERO } from '@orca-so/sdk';
import { computeInputAmount, computeOutputAmount } from '@orca-so/stablecurve';
import { Token, u64 } from '@solana/spl-token';
import { TokenSwap } from '@solana/spl-token-swap';
import type { Signer, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { Transform, Type } from 'class-transformer';

import type { TokenValue } from 'new/sdk/OrcaSwap';
import type { Lamports, TokenAccountBalance } from 'new/sdk/SolanaSDK';
import { AccountInstructions } from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK/extensions/PublicKey/PublicKeyExtensions';

import type { OrcaSwapSolanaClient } from '../apiClient/OrcaSwapSolanaClient';
import { OrcaSwapError } from './OrcaSwapError';

export type OrcaSwapPoolResponse = {
  account: string;
  authority: string;
  nonce: number;
  poolTokenMint: string;
  tokenAccountA: string;
  tokenAccountB: string;
  feeAccount: string;
  hostFeeAccount?: string;
  feeNumerator: number;
  feeDenominator: number;
  ownerTradeFeeNumerator: number;
  ownerTradeFeeDenominator: number;
  ownerWithdrawFeeNumerator: number;
  ownerWithdrawFeeDenominator: number;
  hostFeeNumerator: number;
  hostFeeDenominator: number;
  tokenAName: string;
  tokenBName: string;
  curveType: string;
  programVersion?: number;
  amp?: number;
  deprecated?: boolean;
};

const STABLE = 'Stable';
const CONSTANT_PRODUCT = 'ConstantProduct';

const VERSION_1 = 1;
const VERSION_2 = 2;

type CurveType = 'ConstantProduct' | 'ConstantPrice' | 'Stable' | 'Offset';

export class OrcaSwapTokenName {
  private _tokenName: string;

  constructor(tokenName: string) {
    this._tokenName = tokenName;
  }

  get fixedTokenName(): string {
    return this._tokenName.split('[').shift()!;
  }

  toString(): string {
    return this._tokenName;
  }
}

export class Pool {
  // @ts-ignore
  account: string;
  // @ts-ignore
  authority: string;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  nonce: u64;
  // @ts-ignore
  poolTokenMint: string;
  // @ts-ignore
  tokenAccountA: string;
  // @ts-ignore
  tokenAccountB: string;
  // @ts-ignore
  feeAccount: string;
  // @ts-ignore
  hostFeeAccount: string | null = null;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  feeNumerator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  feeDenominator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  ownerTradeFeeNumerator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  ownerTradeFeeDenominator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  ownerWithdrawFeeNumerator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  ownerWithdrawFeeDenominator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  hostFeeNumerator: u64;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  // @ts-ignore
  hostFeeDenominator: u64;
  @Type(() => OrcaSwapTokenName)
  @Transform(({ value }) => new OrcaSwapTokenName(value))
  // @ts-ignore
  tokenAName: OrcaSwapTokenName;
  @Type(() => OrcaSwapTokenName)
  @Transform(({ value }) => new OrcaSwapTokenName(value))
  // @ts-ignore
  tokenBName: OrcaSwapTokenName;
  // @ts-ignore
  curveType: CurveType;
  @Type(() => u64)
  @Transform(({ value }) => new u64(value))
  amp: u64 | undefined;
  programVersion: number | undefined = 1;
  deprecated: boolean | undefined = false;

  // balance (lazy load)
  tokenABalance?: TokenAccountBalance;
  tokenBBalance?: TokenAccountBalance;

  isStable?: boolean;

  // constructor({
  //   account,
  //   authority,
  //   nonce,
  //   poolTokenMint,
  //   tokenAccountA,
  //   tokenAccountB,
  //   feeAccount,
  //   hostFeeAccount = null,
  //   feeNumerator,
  //   feeDenominator,
  //   ownerTradeFeeNumerator,
  //   ownerTradeFeeDenominator,
  //   ownerWithdrawFeeNumerator,
  //   ownerWithdrawFeeDenominator,
  //   hostFeeNumerator,
  //   hostFeeDenominator,
  //   tokenAName,
  //   tokenBName,
  //   curveType,
  //   amp,
  //   programVersion = 1,
  //   deprecated,
  // }: {
  //   account: string;
  //   authority: string;
  //   nonce: u64;
  //   poolTokenMint: string;
  //   tokenAccountA: string;
  //   tokenAccountB: string;
  //   feeAccount: string;
  //   hostFeeAccount: string | null;
  //   feeNumerator: u64;
  //   feeDenominator: u64;
  //   ownerTradeFeeNumerator: u64;
  //   ownerTradeFeeDenominator: u64;
  //   ownerWithdrawFeeNumerator: u64;
  //   ownerWithdrawFeeDenominator: u64;
  //   hostFeeNumerator: u64;
  //   hostFeeDenominator: u64;
  //   tokenAName: OrcaSwapTokenName;
  //   tokenBName: OrcaSwapTokenName;
  //   curveType: CurveType;
  //   amp: u64 | undefined;
  //   programVersion: number | undefined;
  //   deprecated: boolean | undefined;
  // }) {
  //   this.account = account;
  //   this.authority = authority;
  //   this.nonce = nonce;
  //   this.poolTokenMint = poolTokenMint;
  //   this.tokenAccountA = tokenAccountA;
  //   this.tokenAccountB = tokenAccountB;
  //   this.feeAccount = feeAccount;
  //   this.hostFeeAccount = hostFeeAccount;
  //   this.feeNumerator = feeNumerator;
  //   this.feeDenominator = feeDenominator;
  //   this.ownerTradeFeeNumerator = ownerTradeFeeNumerator;
  //   this.ownerTradeFeeDenominator = ownerTradeFeeDenominator;
  //   this.ownerWithdrawFeeNumerator = ownerWithdrawFeeNumerator;
  //   this.ownerWithdrawFeeDenominator = ownerWithdrawFeeDenominator;
  //   this.hostFeeNumerator = hostFeeNumerator;
  //   this.hostFeeDenominator = hostFeeDenominator;
  //   this.tokenAName = tokenAName;
  //   this.tokenBName = tokenBName;
  //   this.curveType = curveType;
  //   this.amp = amp;
  //   this.programVersion = programVersion;
  //   this.deprecated = deprecated;
  // }

  // TODO: @web references?
  get reversed() {
    const reversedPool = this;

    const [tokenAccountB, tokenAccountA] = [reversedPool.tokenAccountA, reversedPool.tokenAccountB];
    reversedPool.tokenAccountA = tokenAccountA;
    reversedPool.tokenAccountB = tokenAccountB;

    const [tokenBName, tokenAName] = [reversedPool.tokenAName, reversedPool.tokenBName];
    reversedPool.tokenAName = tokenAName;
    reversedPool.tokenBName = tokenBName;

    const [tokenBBalance, tokenABalance] = [reversedPool.tokenABalance, reversedPool.tokenBBalance];
    reversedPool.tokenABalance = tokenABalance;
    reversedPool.tokenBBalance = tokenBBalance;

    return reversedPool;
  }

  get swapProgramId(): PublicKey {
    return SolanaSDKPublicKey.orcaSwapId(this.programVersion === VERSION_2 ? VERSION_2 : VERSION_1);
  }

  getMinimumAmountOut(inputAmount: u64, slippage: number): u64 {
    const estimatedOutputAmount = this.getOutputAmount(inputAmount);
    return estimatedOutputAmount.muln(1 - slippage);
  }

  getInputAmountSlippage(minimumReceiveAmount: u64, slippage: number): u64 | null {
    if (slippage === 1) {
      return null;
    }

    const estimatedAmount = minimumReceiveAmount.divn(1 - slippage);
    return this.getInputAmount(estimatedAmount);
  }

  createSwapInstruction(
    userTransferAuthorityPubkey: PublicKey,
    sourceTokenAddress: PublicKey,
    destinationTokenAddress: PublicKey,
    amountIn: u64,
    minAmountOut: u64,
  ): TransactionInstruction {
    return TokenSwap.swapInstruction(
      new PublicKey(this.account),
      new PublicKey(this.authority),
      new PublicKey(userTransferAuthorityPubkey),
      new PublicKey(sourceTokenAddress),
      new PublicKey(this.tokenAccountA),
      new PublicKey(this.tokenAccountB),
      new PublicKey(destinationTokenAddress),
      new PublicKey(this.poolTokenMint),
      new PublicKey(this.feeAccount),
      this.hostFeeAccount ? new PublicKey(this.hostFeeAccount) : null,
      new PublicKey(this.swapProgramId),
      SolanaSDKPublicKey.tokenProgramId,
      amountIn,
      minAmountOut,
    );
  }

  getInputAmount(estimatedAmount: u64): u64 | null {
    const poolInputAmount = this.tokenABalance?.amountInU64;
    const poolOutputAmount = this.tokenBBalance?.amountInU64;

    if (!poolInputAmount || !poolOutputAmount) {
      throw OrcaSwapError.accountBalanceNotFound();
    }

    if (estimatedAmount.gt(poolOutputAmount)) {
      throw OrcaSwapError.estimatedAmountIsTooHigh();
    }

    switch (this.curveType) {
      case STABLE: {
        const amp = this.amp;
        if (!amp) {
          throw OrcaSwapError.ampDoesNotExistInPoolConfig();
        }

        const inputAmountLessFee = computeInputAmount(
          estimatedAmount,
          poolInputAmount,
          poolOutputAmount,
          amp,
        );
        const inputAmount = inputAmountLessFee
          .mul(this.feeDenominator)
          .div(this.feeDenominator.sub(this.feeNumerator));

        return new u64(inputAmount.toString());
      }
      case CONSTANT_PRODUCT: {
        const invariant = poolInputAmount.mul(poolOutputAmount);

        const newPoolInputAmount = ceilingDivision(
          invariant,
          poolOutputAmount.sub(estimatedAmount),
        ).quotient;
        const inputAmountLessFees = newPoolInputAmount.sub(poolInputAmount);

        let feeRatioNumerator: u64;
        let feeRatioDenominator: u64;

        if (this.ownerTradeFeeDenominator.eq(ZERO)) {
          feeRatioNumerator = this.feeDenominator;
          feeRatioDenominator = this.feeDenominator.sub(this.feeNumerator);
        } else {
          feeRatioNumerator = this.feeDenominator.mul(this.ownerTradeFeeDenominator);
          feeRatioDenominator = this.feeDenominator
            .mul(this.ownerTradeFeeDenominator)
            .sub(this.feeNumerator.mul(this.ownerTradeFeeDenominator))
            .sub(this.ownerTradeFeeNumerator.mul(this.feeDenominator));
        }

        const inputAmount = inputAmountLessFees.mul(feeRatioNumerator).div(feeRatioDenominator);
        return new u64(inputAmount.toString());
      }
      default: {
        return null;
      }
    }
  }

  getOutputAmount(inputAmount: u64): u64 {
    const fees = this.getFee(inputAmount);
    const inputAmountLessFee = inputAmount.sub(fees);
    return this._getOutputAmount(inputAmountLessFee);
  }

  calculatingFees(inputAmount: u64): u64 {
    const inputFees = this.getFee(inputAmount);
    return this._getOutputAmount(inputFees);
  }

  // Public methods

  /// Construct exchange
  constructExchange({
    tokens,
    solanaClient,
    owner,
    fromTokenPubkey,
    toTokenPubkey,
    amount,
    slippage,
    feePayer,
    minRentExemption,
  }: {
    tokens: Map<string, TokenValue>;
    solanaClient: OrcaSwapSolanaClient;
    owner: Signer;
    fromTokenPubkey: string;
    intermediaryTokenAddress?: string;
    toTokenPubkey?: string;
    amount: u64;
    slippage: number;
    feePayer?: PublicKey | null;
    minRentExemption: u64;
  }): Promise<[AccountInstructions, Lamports /*account creation fee*/]> {
    const fromMintStr = tokens.get(this.tokenAName.toString())?.mint;
    const fromMint = fromMintStr ? new PublicKey(fromMintStr) : null;
    const toMintStr = tokens.get(this.tokenBName.toString())?.mint;
    const toMint = toMintStr ? new PublicKey(toMintStr) : null;
    const fromTokenPubkeyNew = new PublicKey(fromTokenPubkey);

    if (!fromMint || !toMint || !fromTokenPubkeyNew) {
      throw OrcaSwapError.notFound();
    }

    // Create fromTokenAccount when needed
    let prepareSourceRequest: Promise<AccountInstructions>;

    if (
      fromMint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
      owner.publicKey.equals(fromTokenPubkeyNew)
    ) {
      prepareSourceRequest = solanaClient.prepareCreatingWSOLAccountAndCloseWhenDone(
        owner.publicKey,
        amount,
        feePayer ?? owner.publicKey,
      );
    } else {
      prepareSourceRequest = Promise.resolve(
        new AccountInstructions({ account: fromTokenPubkeyNew }),
      );
    }

    // If necessary, create a TokenAccount for the output token
    let prepareDestinationRequest: Promise<AccountInstructions>;

    // If destination token is Solana, create WSOL if needed
    if (toMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      const toTokenPubkeyNew = toTokenPubkey ? new PublicKey(toTokenPubkey) : null;
      if (toTokenPubkeyNew && !toTokenPubkeyNew?.equals(owner.publicKey)) {
        // wrapped sol has already been created, just return it, then close later
        prepareDestinationRequest = Promise.resolve(
          new AccountInstructions({
            account: toTokenPubkeyNew,
            cleanupInstructions: [
              Token.createCloseAccountInstruction(
                SolanaSDKPublicKey.tokenProgramId,
                toTokenPubkeyNew,
                owner.publicKey,
                owner.publicKey,
                [],
              ),
            ],
          }),
        );
      } else {
        // create wrapped sol
        prepareDestinationRequest = solanaClient.prepareCreatingWSOLAccountAndCloseWhenDone(
          owner.publicKey,
          ZERO,
          feePayer ?? owner.publicKey,
        );
      }
    } else {
      // If destination is another token and has already been created
      const toTokenPubkeyNew = toTokenPubkey ? new PublicKey(toTokenPubkey) : null;
      if (toTokenPubkeyNew) {
        prepareDestinationRequest = Promise.resolve(
          new AccountInstructions({
            account: toTokenPubkeyNew,
          }),
        );
      }
      // Create associated token address
      else {
        prepareDestinationRequest = solanaClient.prepareForCreatingAssociatedTokenAccount(
          owner.publicKey,
          toMint,
          feePayer ?? owner.publicKey,
          false,
        );
      }
    }

    // Combine request
    return Promise.all([prepareSourceRequest, prepareDestinationRequest]).then(
      ([sourceAccountInstructions, destinationAccountInstructions]) => {
        // form instructions
        const instructions: TransactionInstruction[] = [];
        const cleanupInstructions: TransactionInstruction[] = [];
        let accountCreationFee: u64 = ZERO;

        // source
        instructions.push(...sourceAccountInstructions.instructions);
        cleanupInstructions.push(...sourceAccountInstructions.cleanupInstructions);
        if (!sourceAccountInstructions.instructions.length) {
          accountCreationFee = accountCreationFee.add(minRentExemption);
        }

        // destination
        instructions.push(...destinationAccountInstructions.instructions);
        cleanupInstructions.push(...destinationAccountInstructions.cleanupInstructions);
        if (!destinationAccountInstructions.instructions.length) {
          accountCreationFee = accountCreationFee.add(minRentExemption);
        }

        // swap instructions
        const minAmountOut = this.getMinimumAmountOut(amount, slippage);
        // TODO: check
        // if (!minAmountOut) {
        //   throw OrcaSwapError.couldNotEstimatedMinimumOutAmount();
        // }

        const swapInstruction = this.createSwapInstruction(
          owner.publicKey,
          sourceAccountInstructions.account,
          destinationAccountInstructions.account,
          amount,
          minAmountOut,
        );

        instructions.push(swapInstruction);

        const signers: Signer[] = [];
        signers.push(...sourceAccountInstructions.signers);
        signers.push(...destinationAccountInstructions.signers);

        return [
          new AccountInstructions({
            account: destinationAccountInstructions.account,
            instructions,
            cleanupInstructions,
            signers,
          }),
          accountCreationFee,
        ];
      },
    );
  }

  // Helpers
  getFee(inputAmount: u64) {
    if (this.curveType !== STABLE && this.curveType !== CONSTANT_PRODUCT) {
      throw OrcaSwapError.unknown();
    }

    const tradingFee = this._computeFee({
      baseAmount: inputAmount,
      feeNumerator: this.feeNumerator,
      feeDenominator: this.feeDenominator,
    });

    const ownerFee = this._computeFee({
      baseAmount: inputAmount,
      feeNumerator: this.ownerTradeFeeNumerator,
      feeDenominator: this.ownerTradeFeeDenominator,
    });

    return tradingFee.add(ownerFee);
  }

  private _getOutputAmount(inputAmount: u64): u64 {
    const poolInputAmount = this.tokenABalance?.amountInU64;
    const poolOutputAmount = this.tokenBBalance?.amountInU64;

    if (!poolInputAmount || !poolOutputAmount) {
      throw OrcaSwapError.accountBalanceNotFound();
    }

    switch (this.curveType) {
      case STABLE: {
        const amp = this.amp;
        if (!amp) {
          throw OrcaSwapError.ampDoesNotExistInPoolConfig();
        }
        return computeOutputAmount(inputAmount, poolInputAmount, poolOutputAmount, amp);
      }
      case CONSTANT_PRODUCT: {
        const invariant = poolInputAmount.mul(poolOutputAmount);
        const newPoolOutputAmount = ceilingDivision(
          invariant,
          poolInputAmount.add(inputAmount),
        ).quotient;
        return poolOutputAmount.sub(newPoolOutputAmount);
      }
      default: {
        throw OrcaSwapError.unknown();
      }
    }
  }

  private _computeFee({
    baseAmount,
    feeNumerator,
    feeDenominator,
  }: {
    baseAmount: u64;
    feeNumerator: u64;
    feeDenominator: u64;
  }): u64 {
    if (feeNumerator.eqn(0)) {
      return ZERO;
    }

    return baseAmount.mul(feeNumerator).div(feeDenominator);
  }
}

function ceilingDivision(dividend: u64, divisor: u64): { quotient: u64; divisor: u64 } {
  let quotient = dividend.div(divisor);
  if (quotient.eq(ZERO)) {
    return { quotient: ZERO, divisor };
  }

  let remainder = dividend.mod(divisor);
  if (remainder.gt(ZERO)) {
    quotient = quotient.add(ONE);
    divisor = dividend.div(quotient);
    remainder = dividend.mod(quotient); // TODO: check div - ios div, orca mod
    if (remainder.gt(ZERO)) {
      divisor = divisor.add(ONE);
    }
  }

  return { quotient, divisor };
}
