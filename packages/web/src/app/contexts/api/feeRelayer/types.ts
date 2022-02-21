import type { TokenAccount } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@saberhq/token-utils';
import type { u64 } from '@solana/spl-token';
import type { PublicKey, Transaction } from '@solana/web3.js';

export type FreeFeeLimitsResponce = {
  authority: number[];
  limits: {
    use_free_fee: boolean;
    max_amount: number;
    max_count: number;
    period: {
      secs: number;
      nanos: number;
    };
  };
  processed_fee: {
    total_amount: number;
    count: number;
  };
};

export type UserFreeFeeLimits = {
  maxTransactionCount: number;
  currentTransactionCount: number;
  hasFreeTransactions: boolean;
};

export type UserSwapTransactionSignatures = {
  user_authority_signature: string;
  transfer_authority_signature: string;
};

export type SwapArgs = {
  program_id: string;
  account_pubkey: string;
  authority_pubkey: string;
  transfer_authority_pubkey: string;
  source_pubkey: string;
  destination_pubkey: string;
  pool_token_mint_pubkey: string;
  pool_fee_account_pubkey: string;
  amount_in: number;
  minimum_amount_out: number;
};

export type SplDirectArgs = {
  Spl: SwapArgs;
};

export type SplTransitiveArgs = {
  SplTransitive: {
    from: SwapArgs;
    to: SwapArgs;
    transit_token_mint_pubkey: string;
    needs_create_transit_token_account: boolean;
  };
};

export type TopUpSwapArgs = SplDirectArgs | SplTransitiveArgs;

export type RelayTopUpWithSwap = {
  user_source_token_account_pubkey: string;
  source_token_mint_pubkey: string;
  user_authority_pubkey: string;
  top_up_swap: TopUpSwapArgs;
  fee_amount: number;
  signatures: UserSwapTransactionSignatures;
};

export type RequestAccountMeta = {
  pubkey: number;
  is_signer: boolean;
  is_writable: boolean;
};

export type RequestInstruction = {
  program_id: number;
  accounts: RequestAccountMeta[];
  data: Array<number>;
};

export type RelaySignatures = {
  [idx: number]: string;
};

export type RelayTransaction = {
  instructions: RequestInstruction[];
  signatures: RelaySignatures;
  pubkeys: string[];
  blockhash: string;
};

export type TransactionSignatures = {
  [key: string]: string;
};

export type SignedTransaction = {
  signedTransaction: Transaction;
  signatures: TransactionSignatures;
};

export type UserRelayAccount = {
  exist: boolean;
  balance?: number;
};

export type SwapParams = {
  swapProgramId: PublicKey;
  swapAccount: PublicKey;
  swapAuthority: PublicKey;
  swapSource: PublicKey;
  swapDestination: PublicKey;
  poolTokenMint: PublicKey;
  poolFeeAccount: PublicKey;
  amountIn: u64;
  minimumAmountOut: u64;
};

export type SwapDirectParams = {
  Spl: SwapParams;
};

export type SwapTransitiveData = {
  from: SwapParams;
  to: SwapParams;
  transitTokenMintPubkey: PublicKey;
};

export type SwapTransitiveParams = {
  SplTransitive: SwapTransitiveData;
};

export type CompensationSwapParams = SwapDirectParams | SwapTransitiveParams;

export type DestinationAccount = {
  address: PublicKey;
  owner?: PublicKey;
  isNeedCreate?: boolean;
  symbol?: string;
};

export type CompensationParams = {
  feeToken: TokenAccount | null | undefined;
  feeAmount: u64;
  feeAmountInToken: u64;
  isRelayAccountExist: boolean;
  accountRentExemption: u64;
  isNeedCompensationSwap: boolean;
  topUpParams: CompensationSwapParams | null;
};

export type NextTransactionCompensation = {
  feeAmount: u64;
  feeToken: TokenAccount;
};

export type RelayTopUpWithSwapArgs = {
  feeAmount: u64;
  feeToken: TokenAccount;
  feeAmountInToken: u64;
  needCreateRelayAccount: boolean;
  topUpParams: CompensationSwapParams | null;
};

export type RelayTransferParams = {
  fromTokenAccount: TokenAccount;
  destinationAccount: DestinationAccount;
  amount: TokenAmount;
};

export type WSOLAccountParams = {
  owner: PublicKey;
  amount: u64;
  accountRentExempt: number;
  direction: 'input' | 'output';
};

export type UserSwapParams = SwapParams;

export type UserSwapTransitiveParams = {
  from: SwapParams;
  to: SwapParams;
  intermediateTokenAccount: PublicKey;
};

export type ExchangeData = {
  wsolAccountParams?: WSOLAccountParams;
  swapParams: UserSwapParams | UserSwapTransitiveParams;
};

export type UserSwap = {
  type: 'direct' | 'transitive';
  exchangeData: ExchangeData;
  userSourceTokenAccount: PublicKey;
  userDestinationTokenAccount?: PublicKey;
  amount: u64;
};

export type UserSetupSwap = {
  type: 'intermediateToken' | 'outputUserToken';
  associatedTokenAddress: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
};
