import type { Lamports } from 'new/sdk/SolanaSDK';

// Swap Tokens
export class SwapTokensParams {
  source: string;
  sourceMint: string;
  destination: string;
  destinationMint: string;
  authority: string;
  swapAccount: string;
  feeCompensationSwapAccount: SwapTokensParamsSwapAccount;
  feePayerWSOLAccountKeypair: SwapTokensParamsSwapAccount;
  signature: string;
  blockhash: string;

  constructor({
    source,
    sourceMint,
    destination,
    destinationMint,
    authority,
    swapAccount,
    feeCompensationSwapAccount,
    feePayerWSOLAccountKeypair,
    signature,
    blockhash,
  }: {
    source: string;
    sourceMint: string;
    destination: string;
    destinationMint: string;
    authority: string;
    swapAccount: string;
    feeCompensationSwapAccount: SwapTokensParamsSwapAccount;
    feePayerWSOLAccountKeypair: SwapTokensParamsSwapAccount;
    signature: string;
    blockhash: string;
  }) {
    this.source = source;
    this.sourceMint = sourceMint;
    this.destination = destination;
    this.destinationMint = destinationMint;
    this.authority = authority;
    this.swapAccount = swapAccount;
    this.feeCompensationSwapAccount = feeCompensationSwapAccount;
    this.feePayerWSOLAccountKeypair = feePayerWSOLAccountKeypair;
    this.signature = signature;
    this.blockhash = blockhash;
  }

  toJSON() {
    return {
      user_source_token_account_pubkey: this.source,
      source_token_mint_pubkey: this.sourceMint,
      user_destination_pubkey: this.destination,
      destination_token_mint_pubkey: this.destinationMint,
      user_authority_pubkey: this.authority,
      user_swap: this.swapAccount,
      fee_compensation_swap: this.feeCompensationSwapAccount,
      fee_payer_wsol_account_keypair: this.feePayerWSOLAccountKeypair,
      signature: this.signature,
      blockhash: this.blockhash,
    };
  }
}

export class SwapTokensParamsSwapAccount {
  pubkey: string;
  authority: string;
  transferAuthority: string;
  source: string;
  destination: string;
  poolTokenMint: string;
  poolFeeAccount: string;
  amountIn: Lamports;
  minimumAmountOut: Lamports;

  constructor({
    pubkey,
    authority,
    transferAuthority,
    source,
    destination,
    poolTokenMint,
    poolFeeAccount,
    amountIn,
    minimumAmountOut,
  }: {
    pubkey: string;
    authority: string;
    transferAuthority: string;
    source: string;
    destination: string;
    poolTokenMint: string;
    poolFeeAccount: string;
    amountIn: Lamports;
    minimumAmountOut: Lamports;
  }) {
    this.pubkey = pubkey;
    this.authority = authority;
    this.transferAuthority = transferAuthority;
    this.source = source;
    this.destination = destination;
    this.poolTokenMint = poolTokenMint;
    this.poolFeeAccount = poolFeeAccount;
    this.amountIn = amountIn;
    this.minimumAmountOut = minimumAmountOut;
  }

  toJSON() {
    return {
      account_pubkey: this.pubkey,
      authority_pubkey: this.authority,
      transfer_authority_pubkey: this.transferAuthority,
      source_pubkey: this.source,
      destination_pubkey: this.destination,
      pool_token_mint_pubkey: this.poolTokenMint,
      pool_fee_account_pubkey: this.poolFeeAccount,
      amount_in: this.amountIn,
      minimum_amount_out: this.minimumAmountOut,
    };
  }
}
