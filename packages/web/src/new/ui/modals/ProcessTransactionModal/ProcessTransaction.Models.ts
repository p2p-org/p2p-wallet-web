import { u64 } from '@solana/spl-token';

import type { PayingFee } from 'new/app/models/PayingFee';
import { networkFeesAll } from 'new/app/models/PayingFee';
import type { Recipient } from 'new/scenes/Main/Send';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { convertToBalance, SolanaSDKError, toLamport } from 'new/sdk/SolanaSDK';
import type { SendServiceType } from 'new/services/SendService';
import type * as Send from 'new/services/SendService';
import type { SolanaService } from 'new/services/SolanaService';
import type { SwapServiceType } from 'new/services/Swap';
import { numberToString } from 'new/utils/NumberExtensions';
import { truncatingMiddle } from 'new/utils/StringExtensions';

export interface RawTransactionType {
  createRequest(): Promise<string>;
  readonly mainDescription: string;
  readonly networkFees: { total: SolanaSDK.Lamports; token: SolanaSDK.Token } | null;

  // extensions

  readonly isSwap: boolean;
  readonly payingWallet: Wallet | null;
}

class RawTransactionBase {
  get isSwap(): boolean {
    return this instanceof SwapTransaction;
  }

  get payingWallet(): Wallet | null {
    switch (this.constructor) {
      case SwapTransaction:
        return (this as unknown as SwapTransaction)._payingWallet;
      case SendTransaction:
        return (this as unknown as SendTransaction).payingFeeWallet;
      default:
        return null;
    }
  }

  set payingWallet(wallet: Wallet | null) {
    switch (this.constructor) {
      case SwapTransaction:
        (this as unknown as SwapTransaction)._payingWallet = wallet;
        break;
      case SendTransaction:
        (this as unknown as SendTransaction).payingFeeWallet = wallet;
        break;
    }
  }
}

type MetaInfo = {
  swapMAX: boolean;
  swapUSD: number;
};

export class SwapTransaction extends RawTransactionBase implements RawTransactionType {
  swapService: SwapServiceType;
  sourceWallet: Wallet;
  destinationWallet: Wallet;
  _payingWallet: Wallet | null;
  authority: string | null;
  poolsPair: OrcaSwap.PoolsPair;
  amount: number;
  estimatedAmount: number;
  slippage: number;
  fees: PayingFee[];
  metaInfo: MetaInfo;

  constructor({
    swapService,
    sourceWallet,
    destinationWallet,
    payingWallet = null,
    authority = null,
    poolsPair,
    amount,
    estimatedAmount,
    slippage,
    fees,
    metaInfo,
  }: {
    swapService: SwapServiceType;
    sourceWallet: Wallet;
    destinationWallet: Wallet;
    payingWallet?: Wallet | null;
    authority?: string | null;
    poolsPair: OrcaSwap.PoolsPair;
    amount: number;
    estimatedAmount: number;
    slippage: number;
    fees: PayingFee[];
    metaInfo: MetaInfo;
  }) {
    super();

    this.swapService = swapService;
    this.sourceWallet = sourceWallet;
    this.destinationWallet = destinationWallet;
    this._payingWallet = payingWallet;
    this.authority = authority;
    this.poolsPair = poolsPair;
    this.amount = amount;
    this.estimatedAmount = estimatedAmount;
    this.slippage = slippage;
    this.fees = fees;
    this.metaInfo = metaInfo;
  }

  get mainDescription(): string {
    // @ios: was on ios
    return `${numberToString(this.amount, { maximumFractionDigits: 9 })} ${
      this.sourceWallet.token.symbol
    } -> ${numberToString(this.amount, { maximumFractionDigits: 9 })} ${
      this.destinationWallet.token.symbol
    }`;
    // @web: tried on web with web design
    // return `${this.sourceWallet.token.symbol} -> ${this.destinationWallet.token.symbol}`;
  }

  createRequest(): Promise<string> {
    // check if payingWallet has enough balance to cover fee
    const fees = networkFeesAll(this.fees);
    const payingWallet = this.payingWallet;
    if (fees && payingWallet) {
      const currrentAmount = payingWallet.lamports;
      if (currrentAmount && fees.total.gt(currrentAmount)) {
        throw SolanaSDKError.other(
          `Your account does not have enough SOL to cover fee ${
            payingWallet.token.symbol
          }. Needs at least ${convertToBalance(fees.total, payingWallet.token.decimals)} ${
            payingWallet.token.symbol
          }. Please choose another token and try again!`,
        );
      }
    }

    return this.swapService
      .swap({
        sourceAddress: this.sourceWallet.pubkey!,
        sourceTokenMint: this.sourceWallet.mintAddress,
        destinationAddress: this.destinationWallet.pubkey,
        destinationTokenMint: this.destinationWallet.mintAddress,
        payingTokenAddress: this.payingWallet?.pubkey,
        payingTokenMint: this.payingWallet?.mintAddress,
        poolsPair: this.poolsPair,
        amount: toLamport(this.amount, this.sourceWallet.token.decimals),
        slippage: this.slippage,
      })
      .then((txIds) => txIds.at(-1) ?? '');
  }

  get networkFees(): { total: SolanaSDK.Lamports; token: SolanaSDK.Token } | null {
    const networkFees = networkFeesAll(this.fees)?.total;
    const payingFeeToken = this.payingWallet?.token;
    if (!networkFees || !payingFeeToken) {
      return null;
    }
    return {
      total: networkFees,
      token: payingFeeToken,
    };
  }
}

export class CloseTransaction extends RawTransactionBase implements RawTransactionType {
  solanaSDK: SolanaService;
  closingWallet: Wallet;
  reimbursedAmount: u64;

  constructor({
    solanaSDK,
    closingWallet,
    reimbursedAmount,
  }: {
    solanaSDK: SolanaService;
    closingWallet: Wallet;
    reimbursedAmount: u64;
  }) {
    super();

    this.solanaSDK = solanaSDK;
    this.closingWallet = closingWallet;
    this.reimbursedAmount = reimbursedAmount;
  }

  get mainDescription(): string {
    return `Close account ${this.closingWallet.token.symbol}`;
  }

  createRequest(): Promise<string> {
    const pubkey = this.closingWallet.pubkey;
    if (!pubkey) {
      throw SolanaSDKError.unknown();
    }
    return this.solanaSDK.closeTokenAccount({
      tokenPubkey: pubkey,
    });
  }

  get networkFees(): { total: SolanaSDK.Lamports; token: SolanaSDK.Token } | null {
    return { total: new u64(5000), token: SolanaSDK.Token.nativeSolana }; // TODO: Fix later
  }
}

export class SendTransaction extends RawTransactionBase implements RawTransactionType {
  sendService: SendServiceType;
  network: Send.Network;
  sender: Wallet;
  receiver: Recipient;
  authority: string | null;
  amount: SolanaSDK.Lamports;
  payingFeeWallet: Wallet | null;
  feeInSOL: u64;
  feeInToken: SolanaSDK.FeeAmount | null;
  isSimulation: boolean;

  constructor({
    sendService,
    network,
    sender,
    receiver,
    authority,
    amount,
    payingFeeWallet,
    feeInSOL,
    feeInToken,
    isSimulation,
  }: {
    sendService: SendServiceType;
    network: Send.Network;
    sender: Wallet;
    receiver: Recipient;
    authority: string | null;
    amount: SolanaSDK.Lamports;
    payingFeeWallet: Wallet | null;
    feeInSOL: u64;
    feeInToken: SolanaSDK.FeeAmount | null;
    isSimulation: boolean;
  }) {
    super();

    this.sendService = sendService;
    this.network = network;
    this.sender = sender;
    this.receiver = receiver;
    this.authority = authority;
    this.amount = amount;
    this.payingFeeWallet = payingFeeWallet;
    this.feeInSOL = feeInSOL;
    this.feeInToken = feeInToken;
    this.isSimulation = isSimulation;
  }

  get mainDescription(): string {
    return `${numberToString(convertToBalance(this.amount, this.sender.token.decimals), {
      maximumFractionDigits: 9,
    })} ${this.sender.token.symbol} -> ${
      this.receiver.name ?? truncatingMiddle(this.receiver.address, { numOfSymbolsRevealed: 4 })
    }`;
  }

  createRequest(): Promise<string> {
    return this.sendService.send({
      wallet: this.sender,
      receiver: this.receiver.address,
      amount: convertToBalance(this.amount, this.sender.token.decimals),
      network: this.network,
      payingFeeWallet: this.payingFeeWallet,
    });
  }

  get networkFees(): { total: SolanaSDK.Lamports; token: SolanaSDK.Token } | null {
    const feeInToken = this.feeInToken;
    const token = this.payingFeeWallet?.token;
    if (!feeInToken || !token) {
      return null;
    }
    return {
      total: feeInToken.total,
      token: token,
    };
  }
}

// Transaction status

class NotEnoughNumberOfConfirmationsError extends Error {}

export class ErrorType {
  static NotEnoughNumberOfConfirmationsError = NotEnoughNumberOfConfirmationsError;

  static notEnoughNumberOfConfirmations(): NotEnoughNumberOfConfirmationsError {
    return new NotEnoughNumberOfConfirmationsError('notEnoughNumberOfConfirmations');
  }
}
