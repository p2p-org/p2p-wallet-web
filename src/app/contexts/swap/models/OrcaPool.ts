import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { Account, PublicKey } from '@solana/web3.js';

import { Wallet } from 'api/wallet/Wallet';

import { ProgramIds } from '../config';
import { CurveType, PoolConfig, TokenConfigs } from '../orca-commons';
import { swapInstruction } from '../utils/web3/instructions/pool-instructions';
import TransactionBuilder from '../utils/web3/TransactionBuilder';
import SlippageTolerance from './SlippageTolerance';

export default class OrcaPool {
  poolConfig: PoolConfig;
  tokenAAmount: u64;
  tokenBAmount: u64;

  constructor(poolConfig: PoolConfig, tokenAAmount: u64, tokenBAmount: u64) {
    this.poolConfig = poolConfig;
    this.tokenAAmount = tokenAAmount;
    this.tokenBAmount = tokenBAmount;
  }

  getAccount(): PublicKey {
    return this.poolConfig.account;
  }

  getCurveType(): CurveType {
    return this.poolConfig.curveType;
  }

  getDisplayName() {
    return this.poolConfig.tokenAName + ' / ' + this.poolConfig.tokenBName;
  }

  getPoolId() {
    let poolId = this.poolConfig.tokenAName + '/' + this.poolConfig.tokenBName;

    if (this.poolConfig.curveType === CurveType.Stable) {
      poolId += '[stable]';
    }

    if (this.poolConfig.aquafarmConfig) {
      poolId += '[aquafarm]';
    }

    return poolId;
  }

  isDeprecated() {
    return !!this.poolConfig.deprecated;
  }

  getTokenAName() {
    return this.poolConfig.tokenAName;
  }

  getTokenAAmount() {
    return this.tokenAAmount;
  }

  getTokenBName() {
    return this.poolConfig.tokenBName;
  }

  getTokenBAmount() {
    return this.tokenBAmount;
  }

  getTokenAmountsFromInput(inputTokenName: string): [u64, u64] {
    return inputTokenName === this.getTokenAName()
      ? [this.getTokenAAmount(), this.getTokenBAmount()]
      : [this.getTokenBAmount(), this.getTokenAAmount()];
  }

  getTokenAmountsFromOutput(outputTokenName: string): [u64, u64] {
    return outputTokenName === this.getTokenAName()
      ? [this.getTokenBAmount(), this.getTokenAAmount()]
      : [this.getTokenAAmount(), this.getTokenBAmount()];
  }

  // getOutputAmount is a placeholder function that's implemented
  // by classes the extend OrcaPool
  getOutputAmount(inputAmount: u64, inputTokenName: string): u64 {
    return ZERO;
  }

  getMinimumAmountOut(
    amountIn: u64,
    inputTokenName: string,
    slippageTolerance: SlippageTolerance,
  ): u64 {
    const estimatedOutputAmount = this.getOutputAmount(amountIn, inputTokenName);

    const result = estimatedOutputAmount
      .mul(slippageTolerance.denominator.sub(slippageTolerance.numerator))
      .div(slippageTolerance.denominator);
    return new u64(result.toString());
  }

  async constructExchange(
    wallet: Wallet, // TODO: change to some package
    tokenConfigs: TokenConfigs,
    programIds: ProgramIds,
    inputTokenName: string,
    outputTokenName: string,
    inputAmount: u64,
    minimumOutputAmount: u64,
    accountRentExempt: number,
    transactionBuilder: TransactionBuilder,
    inputUserTokenPublicKey: PublicKey | undefined,
    outputUserTokenPublicKey: PublicKey | undefined,
  ): Promise<{ outputUserTokenPublicKey: PublicKey }> {
    // Only create a wrapped SOL account if `inputUserTokenPublicKey`
    // Otherwise, assume that the WSOL account contains the correct balance
    if (inputTokenName === 'SOL' && !inputUserTokenPublicKey) {
      const account = transactionBuilder.createWSOLAccount(
        wallet.publicKey,
        inputAmount,
        accountRentExempt,
        programIds.token,
        tokenConfigs['SOL'].mint,
      );
      inputUserTokenPublicKey = account.publicKey;
    } else if (!inputUserTokenPublicKey) {
      throw new Error('inputUserTokenPublicKey must be defined if inputTokenName is not SOL');
    }

    // If necessary, create a TokenAccount for the output token
    if (!outputUserTokenPublicKey) {
      outputUserTokenPublicKey = await transactionBuilder.createAssociatedTokenAccount(
        wallet.publicKey,
        tokenConfigs[outputTokenName].mint,
        programIds.token,
      );
    } else if (outputTokenName === 'SOL') {
      const account = transactionBuilder.createWSOLAccount(
        wallet.publicKey,
        ZERO,
        accountRentExempt,
        programIds.token,
        tokenConfigs['SOL'].mint,
      );
      outputUserTokenPublicKey = account.publicKey;
    }

    const userTransferAuthority = new Account();
    transactionBuilder.createApproveInstruction(
      inputUserTokenPublicKey,
      userTransferAuthority,
      wallet.publicKey,
      programIds.token,
      inputAmount,
    );

    transactionBuilder.signers.push(userTransferAuthority);

    // Create swap instruction
    const [inputPoolTokenPublicKey, outputPoolTokenPublicKey] =
      this.poolConfig.tokenAName === outputTokenName
        ? [this.poolConfig.tokenAccountB, this.poolConfig.tokenAccountA]
        : [this.poolConfig.tokenAccountA, this.poolConfig.tokenAccountB];

    transactionBuilder.addInstruction(
      this.createSwapInstruction(
        programIds,
        inputAmount,
        minimumOutputAmount,
        inputUserTokenPublicKey,
        outputUserTokenPublicKey,
        inputPoolTokenPublicKey,
        outputPoolTokenPublicKey,
        userTransferAuthority.publicKey,
        this.poolConfig.hostFeeAccount,
      ),
    );

    return {
      outputUserTokenPublicKey,
    };
  }

  getSwapProgramId(programIds: ProgramIds) {
    switch (this.poolConfig.programVersion) {
      case 2: {
        return programIds.tokenSwapV2;
      }
      default: {
        return programIds.tokenSwap;
      }
    }
  }

  createSwapInstruction(
    programIds: ProgramIds,
    amountIn: u64,
    minimumAmountOut: u64,
    inputUserTokenPublicKey: PublicKey,
    outputUserTokenPublicKey: PublicKey,
    inputPoolTokenPublicKey: PublicKey,
    outputPoolTokenPublicKey: PublicKey,
    userTransferAuthorityPublicKey: PublicKey,
    hostFeeAccountPublicKey: PublicKey | null,
  ) {
    return swapInstruction(
      this.poolConfig.account,
      this.poolConfig.authority,
      userTransferAuthorityPublicKey,
      inputUserTokenPublicKey,
      inputPoolTokenPublicKey,
      outputPoolTokenPublicKey,
      outputUserTokenPublicKey,
      this.poolConfig.poolTokenMint,
      this.poolConfig.feeAccount,
      hostFeeAccountPublicKey,
      this.getSwapProgramId(programIds),
      programIds.token,
      amountIn,
      minimumAmountOut,
    );
  }

  getFeePercentage() {
    return (
      (100 * this.poolConfig.feeNumerator.toNumber()) / this.poolConfig.feeDenominator.toNumber()
    );
  }
}
