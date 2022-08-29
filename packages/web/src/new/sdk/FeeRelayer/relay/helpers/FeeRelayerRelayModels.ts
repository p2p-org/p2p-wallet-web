import { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

import type { StatsInfoDeviceType } from 'new/sdk/FeeRelayer';
import { StatsInfo, StatsInfoOperationType } from 'new/sdk/FeeRelayer';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import type { PoolsPair } from 'new/sdk/OrcaSwap/models/OrcaSwapPools';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';

export type FeeRelayerRelaySwapType = {};

interface Period {
  secs: number;
  nanos: number;
}

interface Limits {
  useFreeFee: boolean;
  maxAmount: u64;
  maxCount: number;
  period: Period;
}

interface ProcessedFee {
  totalAmount: u64;
  count: number;
}

export type FeeLimitForAuthorityResponseType = {
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

export class FeeLimitForAuthorityResponse {
  authority: number[];
  limits: Limits;
  processedFee: ProcessedFee;

  constructor({
    authority,
    limits,
    processedFee,
  }: {
    authority: number[];
    limits: Limits;
    processedFee: ProcessedFee;
  }) {
    this.authority = authority;
    this.limits = limits;
    this.processedFee = processedFee;
  }

  static fromJSON(data: FeeLimitForAuthorityResponseType) {
    const authority = data.authority;
    const limits = <Limits>{
      useFreeFee: data.limits.use_free_fee,
      maxAmount: new u64(data.limits.max_amount),
      maxCount: data.limits.max_count,
      period: {
        secs: data.limits.period.secs,
        nanos: data.limits.period.nanos,
      },
    };
    const processedFee = <ProcessedFee>{
      totalAmount: new u64(data.processed_fee.total_amount),
      count: data.processed_fee.count,
    };

    return new FeeLimitForAuthorityResponse({
      authority,
      limits,
      processedFee,
    });
  }
}

export class FreeTransactionFeeLimit {
  maxUsage: number;
  currentUsage: number;
  maxAmount: u64;
  amountUsed: u64;

  constructor({
    maxUsage,
    currentUsage,
    maxAmount,
    amountUsed,
  }: {
    maxUsage: number;
    currentUsage: number;
    maxAmount: u64;
    amountUsed: u64;
  }) {
    this.maxUsage = maxUsage;
    this.currentUsage = currentUsage;
    this.maxAmount = maxAmount;
    this.amountUsed = amountUsed;
  }

  isFreeTransactionFeeAvailable({
    transactionFee,
    forNextTransaction = false,
  }: {
    transactionFee: u64;
    forNextTransaction?: boolean;
  }): boolean {
    let currentUsage = this.currentUsage;
    if (forNextTransaction) {
      currentUsage += 1;
    }

    return currentUsage < this.maxUsage && this.amountUsed.add(transactionFee).lte(this.maxAmount);
  }
}

// Relay info
export class Cache {
  minimumTokenAccountBalance?: u64;
  minimumRelayAccountBalance?: u64;
  feePayerAddress?: string;
  lamportsPerSignature?: u64;
  relayAccountStatus?: RelayAccountStatus;
  preparedParams?: TopUpAndActionPreparedParams;
  freeTransactionFeeLimit?: FreeTransactionFeeLimit;

  constructor({
    minimumTokenAccountBalance,
    minimumRelayAccountBalance,
    feePayerAddress,
    lamportsPerSignature,
    relayAccountStatus,
    preparedParams,
    freeTransactionFeeLimit,
  }: {
    minimumTokenAccountBalance?: u64;
    minimumRelayAccountBalance?: u64;
    feePayerAddress?: string;
    lamportsPerSignature?: u64;
    relayAccountStatus?: RelayAccountStatus;
    preparedParams?: TopUpAndActionPreparedParams;
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
  } = {}) {
    this.minimumTokenAccountBalance = minimumTokenAccountBalance;
    this.minimumRelayAccountBalance = minimumRelayAccountBalance;
    this.feePayerAddress = feePayerAddress;
    this.lamportsPerSignature = lamportsPerSignature;
    this.relayAccountStatus = relayAccountStatus;
    this.preparedParams = preparedParams;
    this.freeTransactionFeeLimit = freeTransactionFeeLimit;
  }
}

// Top up
export class TopUpWithSwapParams {
  userSourceTokenAccountPubkey: string;
  sourceTokenMintPubkey: string;
  userAuthorityPubkey: string;
  topUpSwap: SwapData;
  feeAmount: u64;
  signatures: SwapTransactionSignatures;
  blockhash: string;
  statsInfo: StatsInfo;

  constructor({
    userSourceTokenAccountPubkey,
    sourceTokenMintPubkey,
    userAuthorityPubkey,
    topUpSwap,
    feeAmount,
    signatures,
    blockhash,
    deviceType,
    buildNumber,
  }: {
    userSourceTokenAccountPubkey: string;
    sourceTokenMintPubkey: string;
    userAuthorityPubkey: string;
    topUpSwap: SwapData;
    feeAmount: u64;
    signatures: SwapTransactionSignatures;
    blockhash: string;
    deviceType: StatsInfoDeviceType;
    buildNumber: string | null;
  }) {
    this.userSourceTokenAccountPubkey = userSourceTokenAccountPubkey;
    this.sourceTokenMintPubkey = sourceTokenMintPubkey;
    this.userAuthorityPubkey = userAuthorityPubkey;
    this.topUpSwap = topUpSwap;
    this.feeAmount = feeAmount;
    this.signatures = signatures;
    this.blockhash = blockhash;
    this.statsInfo = new StatsInfo({
      operationType: StatsInfoOperationType.topUp,
      deviceType,
      currency: sourceTokenMintPubkey,
      build: buildNumber,
    });
  }

  toJSON() {
    return {
      user_source_token_account_pubkey: this.userSourceTokenAccountPubkey,
      source_token_mint_pubkey: this.sourceTokenMintPubkey,
      user_authority_pubkey: this.userAuthorityPubkey,
      top_up_swap: this.topUpSwap.toJSON(),
      fee_amount: this.feeAmount.toNumber,
      signatures: this.signatures.toJSON(),
      blockhash: this.blockhash,
      info: this.statsInfo,
    };
  }
}

// Swap
export class SwapParams {
  userSourceTokenAccountPubkey: string;
  userDestinationPubkey: string;
  userDestinationAccountOwner?: string;
  sourceTokenMintPubkey: string;
  destinationTokenMintPubkey: string;
  userAuthorityPubkey: string;
  userSwap: SwapData;
  feeAmount: u64;
  signatures: SwapTransactionSignatures;
  blockhash: string;
  statsInfo: StatsInfo;

  constructor({
    userSourceTokenAccountPubkey,
    userDestinationPubkey,
    userDestinationAccountOwner,
    sourceTokenMintPubkey,
    destinationTokenMintPubkey,
    userAuthorityPubkey,
    userSwap,
    feeAmount,
    signatures,
    blockhash,
    deviceType,
    buildNumber,
  }: {
    userSourceTokenAccountPubkey: string;
    userDestinationPubkey: string;
    userDestinationAccountOwner?: string;
    sourceTokenMintPubkey: string;
    destinationTokenMintPubkey: string;
    userAuthorityPubkey: string;
    userSwap: SwapData;
    feeAmount: u64;
    signatures: SwapTransactionSignatures;
    blockhash: string;
    deviceType: StatsInfoDeviceType;
    buildNumber: string;
  }) {
    this.userSourceTokenAccountPubkey = userSourceTokenAccountPubkey;
    this.userDestinationPubkey = userDestinationPubkey;
    this.userDestinationAccountOwner = userDestinationAccountOwner;
    this.sourceTokenMintPubkey = sourceTokenMintPubkey;
    this.destinationTokenMintPubkey = destinationTokenMintPubkey;
    this.userAuthorityPubkey = userAuthorityPubkey;
    this.userSwap = userSwap;
    this.feeAmount = feeAmount;
    this.signatures = signatures;
    this.blockhash = blockhash;
    this.statsInfo = new StatsInfo({
      operationType: StatsInfoOperationType.transfer,
      deviceType,
      currency: sourceTokenMintPubkey,
      build: buildNumber,
    });
  }

  toJSON() {
    return {
      user_source_token_account_pubkey: this.userSourceTokenAccountPubkey,
      user_destination_pubkey: this.userDestinationPubkey,
      user_destination_account_owner: this.userDestinationAccountOwner,
      source_token_mint_pubkey: this.sourceTokenMintPubkey,
      destination_token_mint_pubkey: this.destinationTokenMintPubkey,
      user_authority_pubkey: this.userAuthorityPubkey,
      user_swap: this.userSwap.toJSON(),
      fee_amount: this.feeAmount.toNumber(),
      signatures: this.signatures.toJSON(),
      blockhash: this.blockhash,
      info: this.statsInfo,
    };
  }
}

// TransferParam
export class TransferParam {
  senderTokenAccountPubkey: string;
  recipientPubkey: string;
  tokenMintPubkey: string;
  authorityPubkey: string;
  amount: u64;
  feeAmount: u64;
  decimals: number;
  authoritySignature: string;
  blockhash: string;
  statsInfo: StatsInfo;

  constructor({
    senderTokenAccountPubkey,
    recipientPubkey,
    tokenMintPubkey,
    authorityPubkey,
    amount,
    feeAmount,
    decimals,
    authoritySignature,
    blockhash,
    deviceType,
    buildNumber,
  }: {
    senderTokenAccountPubkey: string;
    recipientPubkey: string;
    tokenMintPubkey: string;
    authorityPubkey: string;
    amount: u64;
    feeAmount: u64;
    decimals: number;
    authoritySignature: string;
    blockhash: string;
    deviceType: StatsInfoDeviceType;
    buildNumber: string;
  }) {
    this.senderTokenAccountPubkey = senderTokenAccountPubkey;
    this.recipientPubkey = recipientPubkey;
    this.tokenMintPubkey = tokenMintPubkey;
    this.authorityPubkey = authorityPubkey;
    this.amount = amount;
    this.feeAmount = feeAmount;
    this.decimals = decimals;
    this.authoritySignature = authoritySignature;
    this.blockhash = blockhash;
    this.statsInfo = new StatsInfo({
      operationType: StatsInfoOperationType.transfer,
      deviceType,
      currency: tokenMintPubkey,
      build: buildNumber,
    });
  }

  toJSON() {
    return {
      sender_token_account_pubkey: this.senderTokenAccountPubkey,
      recipient_pubkey: this.recipientPubkey,
      token_mint_pubkey: this.tokenMintPubkey,
      authority_pubkey: this.authorityPubkey,
      amount: this.amount.toNumber(),
      decimals: this.decimals,
      fee_amount: this.feeAmount.toNumber(),
      authority_signature: this.authoritySignature,
      blockhash: this.blockhash,
      info: this.statsInfo,
    };
  }
}

// RelayTransactionParam
export class RelayTransactionParam {
  instructions: RequestInstruction[];
  signatures: { [key in string]: string };
  pubkeys: string[];
  blockhash: string;

  constructor(preparedTransaction: SolanaSDK.PreparedTransaction) {
    const recentBlockhash = preparedTransaction.transaction.recentBlockhash;
    if (!recentBlockhash) {
      throw FeeRelayerError.unknown();
    }

    const message = preparedTransaction.transaction.compileMessage();
    this.pubkeys = message.accountKeys.map((pubkey) => pubkey.toString());
    this.blockhash = recentBlockhash;
    this.instructions = message.instructions.map((compiledInstruction, index) => {
      const accounts: RequestAccountMeta[] = compiledInstruction.accounts.map((account) => {
        const pubkey = message.accountKeys[account];
        const meta = pubkey
          ? preparedTransaction.transaction.instructions[index]?.keys.find((key) =>
              key.pubkey.equals(pubkey),
            )
          : null;

        return new RequestAccountMeta({
          pubkeyIndex: account,
          isSigner: meta?.isSigner ?? message.isAccountSigner(account),
          isWritable: meta?.isWritable ?? message.isAccountWritable(account),
        });
      });

      return new RequestInstruction({
        programIndex: compiledInstruction.programIdIndex,
        accounts,
        data: Buffer.from(bs58.decode(compiledInstruction.data)),
      });
    });

    const signatures: { [key in string]: string } = {};

    // extract publicKeys from signers and add owner
    const publicKeys: PublicKey[] = [preparedTransaction.owner];
    for (const signer of preparedTransaction.signers) {
      publicKeys.push(signer.publicKey);
    }

    for (const publicKey of publicKeys) {
      const idx = this.pubkeys.findIndex((pubkey) => pubkey === publicKey.toString());
      if (idx) {
        const idxString = `${idx}`;
        const signature = preparedTransaction.findSignature(publicKey);
        signatures[idxString] = signature;
      } else {
        throw FeeRelayerError.invalidSignature();
      }
    }
    this.signatures = signatures;
  }

  toJSON() {
    return {
      instructions: this.instructions.map((instruction) => instruction.toJSON()),
      signatures: this.signatures,
      pubkeys: this.pubkeys,
      blockhash: this.blockhash,
    };
  }
}

export class RequestInstruction {
  programIndex: number;
  accounts: RequestAccountMeta[];
  data: Buffer;

  constructor({
    programIndex,
    accounts,
    data,
  }: {
    programIndex: number;
    accounts: RequestAccountMeta[];
    data: Buffer;
  }) {
    this.programIndex = programIndex;
    this.accounts = accounts;
    this.data = data;
  }

  toJSON() {
    return {
      program_id: this.programIndex,
      accounts: this.accounts.map((account) => account.toJSON()),
      data: [...this.data],
    };
  }
}

export class RequestAccountMeta {
  pubkeyIndex: number;
  isSigner: boolean;
  isWritable: boolean;

  constructor({
    pubkeyIndex,
    isSigner,
    isWritable,
  }: {
    pubkeyIndex: number;
    isSigner: boolean;
    isWritable: boolean;
  }) {
    this.pubkeyIndex = pubkeyIndex;
    this.isSigner = isSigner;
    this.isWritable = isWritable;
  }

  toJSON() {
    return {
      pubkey: this.pubkeyIndex,
      is_signer: this.isSigner,
      is_writable: this.isWritable,
    };
  }
}

// Swap data
export class SwapData {
  Spl: DirectSwapData | null;
  SplTransitive: TransitiveSwapData | null;

  constructor(swap: FeeRelayerRelaySwapType) {
    switch (swap.constructor) {
      case DirectSwapData: {
        this.Spl = swap as DirectSwapData;
        this.SplTransitive = null;
        break;
      }
      case TransitiveSwapData: {
        this.Spl = null;
        this.SplTransitive = swap as TransitiveSwapData;
        break;
      }
      default: {
        throw new Error('unsupported swap type');
      }
    }
  }

  toJSON() {
    return {
      Spl: this.Spl?.toJSON(),
      SplTransitive: this.SplTransitive?.toJSON(),
    };
  }
}

export class TransitiveSwapData implements FeeRelayerRelaySwapType {
  from: DirectSwapData;
  to: DirectSwapData;
  transitTokenMintPubkey: PublicKey;
  needsCreateTransitTokenAccount: boolean;

  constructor({
    from,
    to,
    transitTokenMintPubkey,
    needsCreateTransitTokenAccount,
  }: {
    from: DirectSwapData;
    to: DirectSwapData;
    transitTokenMintPubkey: PublicKey;
    needsCreateTransitTokenAccount: boolean;
  }) {
    this.from = from;
    this.to = to;
    this.transitTokenMintPubkey = transitTokenMintPubkey;
    this.needsCreateTransitTokenAccount = needsCreateTransitTokenAccount;
  }

  toJSON() {
    return {
      from: this.from.toJSON(),
      to: this.to.toJSON(),
      transit_token_mint_pubkey: this.transitTokenMintPubkey.toString(),
      needs_create_transit_token_account: this.needsCreateTransitTokenAccount,
    };
  }
}

export class DirectSwapData implements FeeRelayerRelaySwapType {
  programId: PublicKey;
  accountPubkey: PublicKey;
  authorityPubkey: PublicKey;
  transferAuthorityPubkey: PublicKey;
  sourcePubkey: PublicKey;
  destinationPubkey: PublicKey;
  poolTokenMintPubkey: PublicKey;
  poolFeeAccountPubkey: PublicKey;
  amountIn: u64;
  minimumAmountOut: u64;

  constructor({
    programId,
    accountPubkey,
    authorityPubkey,
    transferAuthorityPubkey,
    sourcePubkey,
    destinationPubkey,
    poolTokenMintPubkey,
    poolFeeAccountPubkey,
    amountIn,
    minimumAmountOut,
  }: {
    programId: PublicKey;
    accountPubkey: PublicKey;
    authorityPubkey: PublicKey;
    transferAuthorityPubkey: PublicKey;
    sourcePubkey: PublicKey;
    destinationPubkey: PublicKey;
    poolTokenMintPubkey: PublicKey;
    poolFeeAccountPubkey: PublicKey;
    amountIn: u64;
    minimumAmountOut: u64;
  }) {
    this.programId = programId;
    this.accountPubkey = accountPubkey;
    this.authorityPubkey = authorityPubkey;
    this.transferAuthorityPubkey = transferAuthorityPubkey;
    this.sourcePubkey = sourcePubkey;
    this.destinationPubkey = destinationPubkey;
    this.poolTokenMintPubkey = poolTokenMintPubkey;
    this.poolFeeAccountPubkey = poolFeeAccountPubkey;
    this.amountIn = amountIn;
    this.minimumAmountOut = minimumAmountOut;
  }

  toJSON() {
    return {
      program_id: this.programId.toString(),
      account_pubkey: this.accountPubkey.toString(),
      authority_pubkey: this.authorityPubkey.toString(),
      transfer_authority_pubkey: this.transferAuthorityPubkey.toString(),
      source_pubkey: this.sourcePubkey.toString(),
      destination_pubkey: this.destinationPubkey.toString(),
      pool_token_mint_pubkey: this.poolTokenMintPubkey.toString(),
      pool_fee_account_pubkey: this.poolFeeAccountPubkey.toString(),
      amount_in: this.amountIn.toNumber(), // TODO: check mb string
      minimum_amount_out: this.minimumAmountOut.toNumber(), // TODO: check mb string
    };
  }
}

export class SwapTransactionSignatures {
  userAuthoritySignature: string;
  transferAuthoritySignature?: string | null;

  constructor({
    userAuthoritySignature,
    transferAuthoritySignature = null,
  }: {
    userAuthoritySignature: string;
    transferAuthoritySignature?: string | null;
  }) {
    this.userAuthoritySignature = userAuthoritySignature;
    this.transferAuthoritySignature = transferAuthoritySignature;
  }

  toJSON() {
    return {
      user_authority_signature: this.userAuthoritySignature,
      transfer_authority_signature: this.transferAuthoritySignature,
    };
  }
}

export enum RelayAccountStatusType {
  notYetCreated,
  created,
}

export class RelayAccountStatus {
  type: RelayAccountStatusType;
  private _balance?: u64;

  private constructor({ type, balance }: { type: RelayAccountStatusType; balance?: u64 }) {
    this.type = type;
    this._balance = balance;
  }

  static notYetCreated() {
    return new RelayAccountStatus({
      type: RelayAccountStatusType.notYetCreated,
    });
  }

  static created(balance: u64) {
    return new RelayAccountStatus({ balance, type: RelayAccountStatusType.created });
  }

  get balance() {
    switch (this.type) {
      case RelayAccountStatusType.notYetCreated:
        return null;
      case RelayAccountStatusType.created:
        return this._balance;
    }
  }
}

export class TokenInfo {
  address: string;
  mint: string;

  constructor({ address, mint }: { address: string; mint: string }) {
    this.address = address;
    this.mint = mint;
  }
}

export class TopUpPreparedParams {
  amount: u64;
  expectedFee: u64;
  poolsPair: PoolsPair;

  constructor({
    amount,
    expectedFee,
    poolsPair,
  }: {
    amount: u64;
    expectedFee: u64;
    poolsPair: PoolsPair;
  }) {
    this.amount = amount;
    this.expectedFee = expectedFee;
    this.poolsPair = poolsPair;
  }
}

export class TopUpAndActionPreparedParams {
  topUpPreparedParam?: TopUpPreparedParams | null;
  actionFeesAndPools: FeesAndPools;

  constructor({
    topUpPreparedParam,
    actionFeesAndPools,
  }: {
    topUpPreparedParam?: TopUpPreparedParams | null;
    actionFeesAndPools: FeesAndPools;
  }) {
    this.topUpPreparedParam = topUpPreparedParam;
    this.actionFeesAndPools = actionFeesAndPools;
  }
}

export class FeesAndPools {
  fee: SolanaSDK.FeeAmount;
  poolsPair: PoolsPair;

  constructor({ fee, poolsPair }: { fee: SolanaSDK.FeeAmount; poolsPair: PoolsPair }) {
    this.fee = fee;
    this.poolsPair = poolsPair;
  }
}
