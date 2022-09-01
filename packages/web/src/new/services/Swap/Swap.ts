import type { u64 } from '@solana/spl-token';

import type { PayingFee } from 'new/app/models/PayingFee';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';

enum InputMode {
  source,
  target,
}

class FeeInfo {
  /**
   Get all fees categories. For example: account creation fee, network fee, etc.
   */
  fees: PayingFee[];

  constructor({ fees }: { fees: PayingFee[] }) {
    this.fees = fees;
  }
}

export interface SwapServiceType {
  /**
   Prepare swap service.
   - Returns: `Promise`.
   */
  load(): Promise<void>;

  /**
   Determine the all exchange route.
   - Parameters:
   - sourceMint: the source mint address.
   - destinationMint: the destination mint address.
   - amount: the amount of swapping.
   - inputMode: set amount as `source` or `target`.
   - Returns: Exchange route.
   */
  getPoolPair({
    sourceMint,
    destinationMint,
    amount,
    inputMode,
  }: {
    sourceMint: string;
    destinationMint: string;
    amount: u64;
    inputMode: InputMode;
  }): Promise<OrcaSwap.PoolsPair[]>;

  /**
   Process swap
   - Parameters:
   - sourceAddress: the source address of token in user's wallet.
   - sourceTokenMint: the source mint address of source address.
   - destinationAddress: the destination address of token in wallet, that user wants to swap to.
   - destinationTokenMint: the destination mint address of destination address.
   - payingTokenAddress: the address of token, that will be used as fee paying address.
   - payingTokenMint: the mint address of paying token.
   - poolsPair: the user's selected exchange route. Normally it's the best.
   - amount: the amount of source token.
   - slippage:
   - Returns: The id of transaction.
   */
  swap({
    sourceAddress,
    sourceTokenMint,
    destinationAddress,
    destinationTokenMint,
    payingTokenAddress,
    payingTokenMint,
    poolsPair,
    amount,
    slippage,
  }: {
    sourceAddress: string;
    sourceTokenMint: string;
    destinationAddress?: string | null;
    destinationTokenMint: string;
    payingTokenAddress?: string | null;
    payingTokenMint?: string | null;
    poolsPair: OrcaSwap.PoolsPair;
    amount: u64;
    slippage: number;
  }): Promise<string[]>;

  /**
   Calculate fee for swapping
   - Parameters:
   - sourceAddress: the source address of token in user's wallet.
   - availableSourceMintAddresses:
   - destinationAddress: the destination address of token in wallet, that user wants to swap to.
   - destinationToken: the destination token.
   - bestPoolsPair: the user's selected exchange route
   - inputAmount: the amount of swapping.
   - slippage:
   - lamportsPerSignature: the fee per signature
   - minRentExempt:
   - Returns: The detailed fee information
   - Throws:
   */
  getFees({
    sourceAddress,
    sourceMint,
    availableSourceMintAddresses,
    destinationAddress,
    destinationToken,
    bestPoolsPair,
    payingWallet,
    inputAmount,
    slippage,
    lamportsPerSignature,
    minRentExempt,
  }: {
    sourceAddress: string;
    sourceMint: string;
    availableSourceMintAddresses: string[];
    destinationAddress?: string | null;
    destinationToken: SolanaSDK.Token;
    bestPoolsPair?: OrcaSwap.PoolsPair | null;
    payingWallet?: SolanaSDK.Wallet | null;
    inputAmount?: number | null;
    slippage: number;
    lamportsPerSignature: u64;
    minRentExempt: u64;
  }): Promise<FeeInfo>;

  /**
   Find all possible destination mint addresses.
   - Parameter fromMint:
   - Returns: The list of mint addresses
   - Throws:
   */
  findPosibleDestinationMints(fromMint: string): string[];

  /**
   Calculate amount needed for paying fee in paying token
   */
  calculateNetworkFeeInPayingToken({
    networkFee,
    payingTokenMint,
  }: {
    networkFee: SolanaSDK.FeeAmount;
    payingTokenMint: string;
  }): Promise<SolanaSDK.FeeAmount | null>;
}
