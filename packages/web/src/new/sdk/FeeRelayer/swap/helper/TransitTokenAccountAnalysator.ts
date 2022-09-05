import { PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'new/sdk/FeeRelayer';
import type { FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import { RelayProgram } from 'new/sdk/FeeRelayer/RelayProgram';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import * as SolanaSDK from 'new/sdk/SolanaSDK';

export class TransitTokenAccountAnalysator {
  static getTransitToken({
    solanaApiClient,
    orcaSwap,
    account,
    pools,
  }: {
    solanaApiClient: FeeRelayerRelaySolanaClient; // TODO: change type
    pools: OrcaSwap.PoolsPair;
    account: PublicKey;
    orcaSwap: OrcaSwap.OrcaSwapType;
  }): TokenAccount | null {
    const transitTokenMintPubkey = TransitTokenAccountAnalysator.getTransitTokenMintPubkey({
      orcaSwap,
      pools,
    });
    if (!transitTokenMintPubkey) {
      return null;
    }

    const transitTokenAccountAddress = RelayProgram.getTransitTokenAccountAddress({
      user: account,
      transitTokenMint: transitTokenMintPubkey,
      network: solanaApiClient.endpoint.network,
    });

    return new TokenAccount({
      address: transitTokenAccountAddress,
      mint: transitTokenMintPubkey,
    });
  }

  static getTransitTokenMintPubkey({
    pools,
    orcaSwap,
  }: {
    pools: OrcaSwap.PoolsPair;
    orcaSwap: OrcaSwap.OrcaSwapType;
  }): PublicKey | null {
    if (pools.length !== 2) {
      return null;
    }
    const interTokenName = pools[0]!.tokenBName.toString();
    const mint = orcaSwap.getMint(interTokenName);
    return mint ? new PublicKey(mint) : null;
  }

  static async checkIfNeedsCreateTransitTokenAccount({
    solanaApiClient,
    transitToken,
  }: {
    solanaApiClient: FeeRelayerRelaySolanaClient; // TODO: change type
    transitToken: TokenAccount | null;
  }): Promise<boolean | null> {
    if (!transitToken) {
      return null;
    }

    const account = await solanaApiClient.getAccountInfo({
      account: transitToken.address.toString(),
      decodedTo: SolanaSDK.AccountInfo,
    });
    if (!account) {
      return true;
    }

    return !account.data?.mint.equals(transitToken.mint);
  }
}
