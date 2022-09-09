import type { u64 } from '@solana/spl-token';
import type { Account, PublicKey, TransactionInstruction } from '@solana/web3.js';

import type { TokenAccount } from 'new/sdk/FeeRelayer';
import type { FeeRelayerContext, FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import type { OrcaSwap, PoolsPair } from 'new/sdk/OrcaSwap';
import type { Lamports, PreparedTransaction } from 'new/sdk/SolanaSDK';

export interface BuildContext {
  feeRelayerContext: FeeRelayerContext;
  solanaApiClient: FeeRelayerRelaySolanaClient;
  orcaSwap: OrcaSwap;

  config: Configuration;
  env: Environment;
}

interface Configuration {
  userAccount: PublicKey;

  pools: PoolsPair;
  inputAmount: u64;
  slippage: number;

  sourceAccount: TokenAccount;
  destinationTokenMint: PublicKey;
  destinationAddress?: PublicKey | null;

  blockhash: string;
}

interface Environment {
  userSource?: PublicKey; // null
  sourceWSOLNewAccount?: Account; // null

  transitTokenMintPubkey?: PublicKey;
  transitTokenAccountAddress?: PublicKey;
  needsCreateTransitTokenAccount?: boolean | null;

  destinationNewAccount?: Account; // null
  userDestinationTokenAccountAddress?: PublicKey; // null

  instructions: TransactionInstruction[]; // []
  additionalTransaction?: PreparedTransaction; // null

  signers: Account[]; // []

  // Building fee
  accountCreationFee: Lamports; // 0
  additionalPaybackFee: u64; // 0
}
