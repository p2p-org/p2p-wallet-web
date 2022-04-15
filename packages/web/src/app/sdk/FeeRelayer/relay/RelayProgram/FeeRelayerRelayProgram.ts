/* eslint-disable @typescript-eslint/no-magic-numbers */
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import type { Network } from '@saberhq/solana-contrib';
import type { u64 } from '@solana/spl-token';
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import BufferLayout from 'buffer-layout';

import { readonly, SolanaSDKPublicKey, writable } from 'app/sdk/SolanaSDK';

import type { FeeRelayerRelaySwapType } from '..';
import { DirectSwapData, TransitiveSwapData } from '..';

export class FeeRelayerRelayProgram {
  static id(network: Network): PublicKey {
    switch (network) {
      case 'mainnet-beta':
      default:
        return new PublicKey('12YKFL4mnZz6CBEGePrf293mEzueQM3h8VLPUJsKpGs9');
      case 'devnet':
        return new PublicKey('6xKJFyuM6UHCT8F5SBxnjGt6ZrZYjsVfnAnAeHPU775k');
      case 'testnet':
        return new PublicKey('6xKJFyuM6UHCT8F5SBxnjGt6ZrZYjsVfnAnAeHPU775k');
    }
  }

  static getUserRelayAddress({ user, network }: { user: PublicKey; network: Network }): PublicKey {
    return findProgramAddressSync(
      [user.toBuffer(), Buffer.from('relay')],
      FeeRelayerRelayProgram.id(network),
    )[0];
  }

  static getUserTemporaryWSOLAddress({
    user,
    network,
  }: {
    user: PublicKey;
    network: Network;
  }): PublicKey {
    return findProgramAddressSync(
      [user.toBuffer(), Buffer.from('temporary_wsol')],
      FeeRelayerRelayProgram.id(network),
    )[0];
  }

  static getTransitTokenAccountAddress({
    user,
    transitTokenMint,
    network,
  }: {
    user: PublicKey;
    transitTokenMint: PublicKey;
    network: Network;
  }): PublicKey {
    return findProgramAddressSync(
      [user.toBuffer(), transitTokenMint.toBuffer(), Buffer.from('transit')],
      FeeRelayerRelayProgram.id(network),
    )[0];
  }

  static topUpSwapInstruction({
    network,
    topUpSwap,
    userAuthorityAddress,
    userSourceTokenAccountAddress,
    feePayerAddress,
  }: {
    network: Network;
    topUpSwap: FeeRelayerRelaySwapType;
    userAuthorityAddress: PublicKey;
    userSourceTokenAccountAddress: PublicKey;
    feePayerAddress: PublicKey;
  }): TransactionInstruction {
    const userRelayAddress = this.getUserRelayAddress({
      user: userAuthorityAddress,
      network,
    });
    const userTemporarilyWSOLAddress = this.getUserTemporaryWSOLAddress({
      user: userAuthorityAddress,
      network,
    });

    const swap = topUpSwap;
    switch (swap.constructor) {
      case DirectSwapData: {
        return this._topUpWithSPLSwapDirectInstruction({
          feePayer: feePayerAddress,
          userAuthority: userAuthorityAddress,
          userRelayAccount: userRelayAddress,
          userTransferAuthority: (swap as DirectSwapData).transferAuthorityPubkey,
          userSourceTokenAccount: userSourceTokenAccountAddress,
          userTemporaryWsolAccount: userTemporarilyWSOLAddress,
          swapProgramId: (swap as DirectSwapData).programId,
          swapAccount: (swap as DirectSwapData).accountPubkey,
          swapAuthority: (swap as DirectSwapData).authorityPubkey,
          swapSource: (swap as DirectSwapData).sourcePubkey,
          swapDestination: (swap as DirectSwapData).destinationPubkey,
          poolTokenMint: (swap as DirectSwapData).poolTokenMintPubkey,
          poolFeeAccount: (swap as DirectSwapData).poolFeeAccountPubkey,
          amountIn: (swap as DirectSwapData).amountIn,
          minimumAmountOut: (swap as DirectSwapData).minimumAmountOut,
          network,
        });
      }
      case TransitiveSwapData: {
        return this._topUpWithSPLSwapTransitiveInstruction({
          feePayer: feePayerAddress,
          userAuthority: userAuthorityAddress,
          userRelayAccount: userRelayAddress,
          userTransferAuthority: (swap as TransitiveSwapData).from.transferAuthorityPubkey,
          userSourceTokenAccount: userSourceTokenAccountAddress,
          userDestinationTokenAccount: userTemporarilyWSOLAddress,
          transitTokenMint: (swap as TransitiveSwapData).transitTokenMintPubkey,
          swapFromProgramId: (swap as TransitiveSwapData).from.programId,
          swapFromAccount: (swap as TransitiveSwapData).from.accountPubkey,
          swapFromAuthority: (swap as TransitiveSwapData).from.authorityPubkey,
          swapFromSource: (swap as TransitiveSwapData).from.sourcePubkey,
          swapFromDestination: (swap as TransitiveSwapData).from.destinationPubkey,
          swapFromPoolTokenMint: (swap as TransitiveSwapData).from.poolTokenMintPubkey,
          swapFromPoolFeeAccount: (swap as TransitiveSwapData).from.poolFeeAccountPubkey,
          swapToProgramId: (swap as TransitiveSwapData).to.programId,
          swapToAccount: (swap as TransitiveSwapData).to.accountPubkey,
          swapToAuthority: (swap as TransitiveSwapData).to.authorityPubkey,
          swapToSource: (swap as TransitiveSwapData).to.sourcePubkey,
          swapToDestination: (swap as TransitiveSwapData).to.destinationPubkey,
          swapToPoolTokenMint: (swap as TransitiveSwapData).to.poolTokenMintPubkey,
          swapToPoolFeeAccount: (swap as TransitiveSwapData).to.poolFeeAccountPubkey,
          amountIn: (swap as TransitiveSwapData).from.amountIn,
          transitMinimumAmount: (swap as TransitiveSwapData).from.minimumAmountOut,
          minimumAmountOut: (swap as TransitiveSwapData).to.minimumAmountOut,
          network,
        });
      }
      default:
        throw new Error('unsupported swap type');
    }
  }

  static transferSolInstruction({
    userAuthorityAddress,
    recipient,
    lamports,
    network,
  }: {
    userAuthorityAddress: PublicKey;
    recipient: PublicKey;
    lamports: u64;
    network: Network;
  }): TransactionInstruction {
    const keys = [
      readonly({ pubkey: userAuthorityAddress, isSigner: true }),
      writable({
        pubkey: this.getUserRelayAddress({
          user: userAuthorityAddress,
          network,
        }),
        isSigner: false,
      }),
      writable({ pubkey: recipient, isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.programId(), isSigner: false }),
    ];
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.blob(8, 'amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 2,
        amount: lamports.toBuffer(),
      },
      data,
    );

    return new TransactionInstruction({
      keys,
      programId: this.id(network),
      data,
    });
  }

  static createTransitTokenAccountInstruction({
    feePayer,
    userAuthority,
    transitTokenAccount,
    transitTokenMint,
    network,
  }: {
    feePayer: PublicKey;
    userAuthority: PublicKey;
    transitTokenAccount: PublicKey;
    transitTokenMint: PublicKey;
    network: Network;
  }): TransactionInstruction {
    const keys = [
      writable({ pubkey: transitTokenAccount, isSigner: false }),
      readonly({ pubkey: transitTokenMint, isSigner: false }),
      writable({ pubkey: userAuthority, isSigner: true }),
      readonly({ pubkey: feePayer, isSigner: true }),
      readonly({ pubkey: SolanaSDKPublicKey.tokenProgramId(), isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.sysvarRent(), isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.programId(), isSigner: false }),
    ];

    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 3,
      },
      data,
    );
    return new TransactionInstruction({
      keys,
      programId: this.id(network),
      data,
    });
  }

  // Helpers

  private static _topUpWithSPLSwapDirectInstruction({
    feePayer,
    userAuthority,
    userRelayAccount,
    userTransferAuthority,
    userSourceTokenAccount,
    userTemporaryWsolAccount,
    swapProgramId,
    swapAccount,
    swapAuthority,
    swapSource,
    swapDestination,
    poolTokenMint,
    poolFeeAccount,
    amountIn,
    minimumAmountOut,
    network,
  }: {
    feePayer: PublicKey;
    userAuthority: PublicKey;
    userRelayAccount: PublicKey;
    userTransferAuthority: PublicKey;
    userSourceTokenAccount: PublicKey;
    userTemporaryWsolAccount: PublicKey;
    swapProgramId: PublicKey;
    swapAccount: PublicKey;
    swapAuthority: PublicKey;
    swapSource: PublicKey;
    swapDestination: PublicKey;
    poolTokenMint: PublicKey;
    poolFeeAccount: PublicKey;
    amountIn: u64;
    minimumAmountOut: u64;
    network: Network;
  }): TransactionInstruction {
    const keys = [
      readonly({ pubkey: SolanaSDKPublicKey.wrappedSOLMint(), isSigner: false }),
      writable({ pubkey: feePayer, isSigner: true }),
      readonly({ pubkey: userAuthority, isSigner: true }),
      writable({ pubkey: userRelayAccount, isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.tokenProgramId(), isSigner: false }),
      readonly({ pubkey: swapProgramId, isSigner: false }),
      readonly({ pubkey: swapAccount, isSigner: false }),
      readonly({ pubkey: swapAuthority, isSigner: false }),
      readonly({ pubkey: userTransferAuthority, isSigner: true }),
      writable({ pubkey: userSourceTokenAccount, isSigner: false }),
      writable({ pubkey: userTemporaryWsolAccount, isSigner: false }),
      writable({ pubkey: swapSource, isSigner: false }),
      writable({ pubkey: swapDestination, isSigner: false }),
      writable({ pubkey: poolTokenMint, isSigner: false }),
      writable({ pubkey: poolFeeAccount, isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.sysvarRent(), isSigner: false }),
      readonly({ pubkey: SolanaSDKPublicKey.programId(), isSigner: false }),
    ];

    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.blob(8, 'amountIn'), // TODO: check method
      BufferLayout.blob(8, 'minimumAmountOut'), // TODO: check method
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 0,
        amountIn: amountIn.toBuffer(),
        minimumAmountOut: minimumAmountOut.toBuffer(),
      },
      data,
    );

    return new TransactionInstruction({
      keys,
      programId: this.id(network),
      data,
    });
  }

  private static _topUpWithSPLSwapTransitiveInstruction({
    feePayer,
    userAuthority,
    userRelayAccount,
    userTransferAuthority,
    userSourceTokenAccount,
    userDestinationTokenAccount,
    transitTokenMint,
    swapFromProgramId,
    swapFromAccount,
    swapFromAuthority,
    swapFromSource,
    swapFromDestination,
    swapFromPoolTokenMint,
    swapFromPoolFeeAccount,
    swapToProgramId,
    swapToAccount,
    swapToAuthority,
    swapToSource,
    swapToDestination,
    swapToPoolTokenMint,
    swapToPoolFeeAccount,
    amountIn,
    transitMinimumAmount,
    minimumAmountOut,
    network,
  }: {
    feePayer: PublicKey;
    userAuthority: PublicKey;
    userRelayAccount: PublicKey;
    userTransferAuthority: PublicKey;
    userSourceTokenAccount: PublicKey;
    userDestinationTokenAccount: PublicKey;
    transitTokenMint: PublicKey;
    swapFromProgramId: PublicKey;
    swapFromAccount: PublicKey;
    swapFromAuthority: PublicKey;
    swapFromSource: PublicKey;
    swapFromDestination: PublicKey;
    swapFromPoolTokenMint: PublicKey;
    swapFromPoolFeeAccount: PublicKey;
    swapToProgramId: PublicKey;
    swapToAccount: PublicKey;
    swapToAuthority: PublicKey;
    swapToSource: PublicKey;
    swapToDestination: PublicKey;
    swapToPoolTokenMint: PublicKey;
    swapToPoolFeeAccount: PublicKey;
    amountIn: u64;
    transitMinimumAmount: u64;
    minimumAmountOut: u64;
    network: Network;
  }): TransactionInstruction {
    const keys = [
      readonly({ pubkey: NATIVE_MINT, isSigner: false }),
      writable({ pubkey: feePayer, isSigner: true }),
      readonly({ pubkey: userAuthority, isSigner: true }),
      writable({ pubkey: userRelayAccount, isSigner: false }),
      readonly({ pubkey: TOKEN_PROGRAM_ID, isSigner: false }),
      readonly({ pubkey: userTransferAuthority, isSigner: true }),
      writable({ pubkey: userSourceTokenAccount, isSigner: false }),
      writable({
        pubkey: this.getTransitTokenAccountAddress({
          user: userAuthority,
          transitTokenMint,
          network,
        }),
        isSigner: false,
      }),
      writable({ pubkey: userDestinationTokenAccount, isSigner: false }),
      readonly({ pubkey: swapFromProgramId, isSigner: false }),
      readonly({ pubkey: swapFromAccount, isSigner: false }),
      readonly({ pubkey: swapFromAuthority, isSigner: false }),
      writable({ pubkey: swapFromSource, isSigner: false }),
      writable({ pubkey: swapFromDestination, isSigner: false }),
      writable({ pubkey: swapFromPoolTokenMint, isSigner: false }),
      writable({ pubkey: swapFromPoolFeeAccount, isSigner: false }),
      readonly({ pubkey: swapToProgramId, isSigner: false }),
      readonly({ pubkey: swapToAccount, isSigner: false }),
      readonly({ pubkey: swapToAuthority, isSigner: false }),
      writable({ pubkey: swapToSource, isSigner: false }),
      writable({ pubkey: swapToDestination, isSigner: false }),
      writable({ pubkey: swapToPoolTokenMint, isSigner: false }),
      writable({ pubkey: swapToPoolFeeAccount, isSigner: false }),
      readonly({ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false }),
      readonly({ pubkey: SystemProgram.programId, isSigner: false }),
    ];

    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.blob(8, 'amountIn'),
      BufferLayout.blob(8, 'transitMinimumAmount'),
      BufferLayout.blob(8, 'minimumAmountOut'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 1,
        amountIn: amountIn.toBuffer(),
        transitMinimumAmount: transitMinimumAmount.toBuffer(),
        minimumAmountOut: minimumAmountOut.toBuffer(),
      },
      data,
    );

    return new TransactionInstruction({
      keys,
      programId: this.id(network),
      data,
    });
  }
}
