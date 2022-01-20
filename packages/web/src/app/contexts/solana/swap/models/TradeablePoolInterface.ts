import type { ReactNode } from 'react';

import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import type { ProgramIds } from '../config';
import type TransactionBuilder from '../utils/web3/TransactionBuilder';
import type SlippageTolerance from './SlippageTolerance';

export default interface TradeablePoolInterface {
  getDisplayName(): ReactNode;
  getPoolId(): string;
  getAccount(): PublicKey;
  isDeprecated(): boolean;
  getTokenAName(): string;
  getTokenAAmount(): u64;
  getTokenBName(): string;
  getTokenBAmount(): u64;
  getOutputAmount(inputAmount: u64, inputTokenName: string): u64;
  getBaseOutputAmount(inputAmount: u64, inputTokenName: string): u64;
  getInputAmount(outputAmount: u64, outputTokenName: string): u64;
  getMinimumAmountOut(
    amountIn: u64,
    inputTokenName: string,
    slippageTolerance: SlippageTolerance,
  ): u64;
  constructExchange(
    walletPublicKey: PublicKey,
    programIds: ProgramIds,
    inputTokenName: string,
    outputTokenName: string,
    inputAmount: u64,
    minimumOutputAmount: u64,
    accountRentExempt: number,
    transactionBuilder: TransactionBuilder,
    inputUserTokenPublicKey: PublicKey | undefined,
    outputUserTokenPublicKey: PublicKey | undefined,
  ): Promise<{ outputUserTokenPublicKey: PublicKey }>;
  calculateFees(inputAmount: u64, inputTokenName: string): u64;
  getFeePercentage(): number;
}

export class OutputTooHighError extends Error {}
