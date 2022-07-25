import { ONE, ZERO } from '@orca-so/sdk';
import { computeInputAmount, computeOutputAmount } from '@orca-so/stablecurve';
import { Token, u64 } from '@solana/spl-token';
// import { TokenSwap } from '@solana/spl-token-swap';
import type { Signer, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { Lamports, TokenAccountBalance } from 'new/sdk/SolanaSDK';
import { AccountInstructions } from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK/extensions/PublicKey/PublicKeyExtensions';

import type { OrcaSwapSolanaClient } from '../apiClient/OrcaSwapSolanaClient';
import { OrcaSwapError } from './OrcaSwapError';
import type { OrcaSwapTokens } from './OrcaSwapToken';

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

export class OrcaSwapPool {
  isStable?: boolean;

  // balance (lazy load)
  tokenABalance?: TokenAccountBalance;
  tokenBBalance?: TokenAccountBalance;

  constructor(
    public account: PublicKey,
    public authority: PublicKey,
    public nonce: number,
    public poolTokenMint: PublicKey,
    public tokenAccountA: PublicKey,
    public tokenAccountB: PublicKey,
    public feeAccount: PublicKey,
    public hostFeeAccount: PublicKey | null = null,
    public feeNumerator: u64,
    public feeDenominator: u64,
    public ownerTradeFeeNumerator: u64,
    public ownerTradeFeeDenominator: u64,
    public ownerWithdrawFeeNumerator: u64,
    public ownerWithdrawFeeDenominator: u64,
    public hostFeeNumerator: u64,
    public hostFeeDenominator: u64,
    public tokenAName: OrcaSwapTokenName,
    public tokenBName: OrcaSwapTokenName,
    public curveType: CurveType,
    public deprecated: boolean = false,
    public programVersion: number = 1,
    public amp: u64 | undefined,
  ) {}

  static fromNetwork(response: OrcaSwapPoolResponse): OrcaSwapPool {
    return new OrcaSwapPool(
      new PublicKey(response.account),
      new PublicKey(response.authority),
      response.nonce,
      new PublicKey(response.poolTokenMint),
      new PublicKey(response.tokenAccountA),
      new PublicKey(response.tokenAccountB),
      new PublicKey(response.feeAccount),
      response.hostFeeAccount ? new PublicKey(response.hostFeeAccount) : undefined,
      new u64(response.feeNumerator),
      new u64(response.feeDenominator),
      new u64(response.ownerTradeFeeNumerator),
      new u64(response.ownerTradeFeeDenominator),
      new u64(response.ownerWithdrawFeeNumerator),
      new u64(response.ownerWithdrawFeeDenominator),
      new u64(response.hostFeeNumerator),
      new u64(response.hostFeeDenominator),
      new OrcaSwapTokenName(response.tokenAName),
      new OrcaSwapTokenName(response.tokenBName),
      response.curveType as CurveType,
      response.deprecated,
      response.programVersion,
      response.amp ? new u64(response.amp) : undefined,
    );
  }

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
      this.account,
      this.authority,
      userTransferAuthorityPubkey,
      sourceTokenAddress,
      this.tokenAccountA,
      this.tokenAccountB,
      destinationTokenAddress,
      this.poolTokenMint,
      this.feeAccount,
      this.hostFeeAccount,
      this.swapProgramId,
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

        return inputAmount;
      }
      case CONSTANT_PRODUCT: {
        const invariant = poolInputAmount.mul(poolOutputAmount);

        const [newPoolInputAmount] = ceilingDivision(
          invariant,
          poolOutputAmount.sub(estimatedAmount),
        );
        const inputAmountLessFees = newPoolInputAmount.sub(poolInputAmount);

        let feeRatioNumerator: u64, feeRatioDenominator: u64;

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

        return inputAmount;
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
    tokens: OrcaSwapTokens;
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
    const fromMintStr = tokens[this.tokenAName.toString()]?.mint;
    const fromMint = fromMintStr ? new PublicKey(fromMintStr) : null;
    const toMintStr = tokens[this.tokenBName.toString()]?.mint;
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
        const [newPoolOutputAmount] = ceilingDivision(invariant, poolInputAmount.add(inputAmount));
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

export class OrcaSwapTokenName {
  constructor(private _tokenName: string) {}

  get fixedTokenName(): string {
    return this._tokenName.split('[').shift()!;
  }

  toString(): string {
    return this._tokenName;
  }
}

function ceilingDivision(dividend: u64, divisor: u64): [u64, u64] {
  let quotient = dividend.div(divisor);
  if (quotient.eq(ZERO)) {
    return [ZERO, divisor];
  }

  let remainder = dividend.mod(divisor);
  if (remainder.gt(ZERO)) {
    quotient = quotient.add(ONE);
    divisor = dividend.div(quotient);
    remainder = dividend.mod(quotient);
    if (remainder.gt(ZERO)) {
      divisor = divisor.add(ONE);
    }
  }

  return [quotient, divisor];
}
