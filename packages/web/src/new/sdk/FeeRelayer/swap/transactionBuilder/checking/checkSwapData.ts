import { Token } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import { FeeRelayerError } from '../../../models';
import { DirectSwapData, TransitiveSwapData } from '../../../relay';
import { RelayProgram } from '../../../relayProgram';
import type { BuildContext } from '../BuildContext';
import type { SwapData } from './SwapDataBuilder';

export function checkSwapData(context: BuildContext, swapData: SwapData): void {
  const userTransferAuthority = swapData.transferAuthorityAccount?.publicKey;

  const swap = swapData.swapData;
  switch (swap.constructor) {
    case DirectSwapData: {
      const pool = context.config.pools[0];
      if (!pool) {
        throw FeeRelayerError.swapPoolsNotFound();
      }

      // approve
      if (userTransferAuthority) {
        context.env.instructions.push(
          Token.createApproveInstruction(
            SolanaSDKPublicKey.tokenProgramId,
            context.env.userSource!,
            userTransferAuthority,
            context.config.userAccount,
            [],
            (swap as DirectSwapData).amountIn,
          ),
        );
      }

      // swap
      context.env.instructions.push(
        pool.createSwapInstruction({
          userTransferAuthorityPubkey: userTransferAuthority ?? context.config.userAccount,
          sourceTokenAddress: context.env.userSource!,
          destinationTokenAddress: context.env.userDestinationTokenAccountAddress!,
          amountIn: (swap as DirectSwapData).amountIn,
          minAmountOut: (swap as DirectSwapData).minimumAmountOut,
        }),
      );

      break;
    }
    case TransitiveSwapData: {
      // approve
      if (userTransferAuthority) {
        context.env.instructions.push(
          Token.createApproveInstruction(
            SolanaSDKPublicKey.tokenProgramId,
            context.env.userSource!,
            userTransferAuthority,
            context.config.userAccount,
            [],
            (swap as TransitiveSwapData).from.amountIn,
          ),
        );
      }

      // create transit token account
      const transitTokenMint = new PublicKey((swap as TransitiveSwapData).transitTokenMintPubkey);
      const transitTokenAccountAddressNew = RelayProgram.getTransitTokenAccountAddress({
        user: context.config.userAccount,
        transitTokenMint,
        network: context.solanaApiClient.endpoint.network,
      });

      if (context.env.needsCreateTransitTokenAccount) {
        context.env.instructions.push(
          RelayProgram.createTransitTokenAccountInstruction({
            feePayer: context.feeRelayerContext.feePayerAddress,
            userAuthority: context.config.userAccount,
            transitTokenAccount: transitTokenAccountAddressNew,
            transitTokenMint,
            network: context.solanaApiClient.endpoint.network,
          }),
        );
      }

      // relay swap
      context.env.instructions.push(
        RelayProgram.createRelaySwapInstruction({
          transitiveSwap: swap as TransitiveSwapData,
          userAuthorityAddressPubkey: context.config.userAccount,
          sourceAddressPubkey: context.env.userSource!,
          transitTokenAccount: transitTokenAccountAddressNew,
          destinationAddressPubkey: context.env.userDestinationTokenAccountAddress!,
          feePayerPubkey: context.feeRelayerContext.feePayerAddress,
          network: context.solanaApiClient.endpoint.network,
        }),
      );
      break;
    }
    default:
      throw new Error('unsupported swap type');
  }
}
