import { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import { DestinationAnalysator } from 'new/sdk/FeeRelayer';
import type { FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import type { FeeRelayerContext } from 'new/sdk/FeeRelayer/relay/FeeRelayerContext';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export interface SwapFeeRelayerCalculator {
  calculateSwappingNetworkFees({
    context,
    swapPools,
    sourceTokenMint,
    destinationTokenMint,
    destinationAddress,
  }: {
    context: FeeRelayerContext;
    swapPools?: OrcaSwap.PoolsPair | null;
    sourceTokenMint: PublicKey;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey | null;
  }): Promise<SolanaSDK.FeeAmount>;
}

export class DefaultSwapFeeRelayerCalculator implements SwapFeeRelayerCalculator {
  solanaApiClient: FeeRelayerRelaySolanaClient;
  owner: PublicKey;

  constructor({
    solanaApiClient,
    owner,
  }: {
    solanaApiClient: FeeRelayerRelaySolanaClient;
    owner: PublicKey;
  }) {
    this.solanaApiClient = solanaApiClient;
    this.owner = owner;
  }

  async calculateSwappingNetworkFees({
    context,
    swapPools,
    sourceTokenMint,
    destinationTokenMint,
    destinationAddress,
  }: {
    context: FeeRelayerContext;
    swapPools?: OrcaSwap.PoolsPair | null;
    sourceTokenMint: PublicKey;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey | null;
  }): Promise<SolanaSDK.FeeAmount> {
    const destinationInfo = await DestinationAnalysator.analyseDestination({
      apiClient: this.solanaApiClient,
      destination: destinationAddress,
      mint: destinationTokenMint,
      userAccount: this.owner,
    });

    const lamportsPerSignature = context.lamportsPerSignature;
    const minimumTokenAccountBalance = context.minimumTokenAccountBalance;

    const expectedFee = SolanaSDK.FeeAmount.zero();

    // fee for payer's signature
    expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));

    // fee for owner's signature
    expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));

    // when source token is native SOL
    if (sourceTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      // WSOL's signature
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
    }

    // when needed to create destination
    if (
      destinationInfo.needCreateDestination &&
      !destinationTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)
    ) {
      expectedFee.accountBalances = new u64(
        expectedFee.accountBalances.add(minimumTokenAccountBalance),
      );
    }

    // when destination is native SOL
    if (destinationTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
    }

    // in transitive swap, there will be situation when swapping from SOL -> SPL that needs spliting transaction to 2 transactions
    if (
      swapPools?.length === 2 &&
      sourceTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
      !destinationAddress
    ) {
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature.muln(2)));
    }

    return expectedFee;
  }
}
