import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import * as SolanaSDK from 'new/sdk/SolanaSDK';

export enum FeeTypeEnum {
  liquidityProviderFee,
  accountCreationFee,
  orderCreationFee,
  transactionFee,
  depositWillBeReturned,
}

export class FeeType {
  type: FeeTypeEnum;
  private readonly _token?: string;

  constructor({ type, token }: { type: FeeTypeEnum; token?: string }) {
    this.type = type;
    this._token = token;
  }

  static get liquidityProviderFee(): FeeType {
    return new FeeType({ type: FeeTypeEnum.liquidityProviderFee });
  }

  static accountCreationFee(token?: string): FeeType {
    return new FeeType({ type: FeeTypeEnum.accountCreationFee, token });
  }

  static get orderCreationFee(): FeeType {
    return new FeeType({ type: FeeTypeEnum.orderCreationFee });
  }

  static get transactionFee(): FeeType {
    return new FeeType({ type: FeeTypeEnum.transactionFee });
  }

  static get depositWillBeReturned(): FeeType {
    return new FeeType({ type: FeeTypeEnum.depositWillBeReturned });
  }

  get headerString(): string {
    switch (this.type) {
      case FeeTypeEnum.liquidityProviderFee:
        return 'Liquidity provider fee';
      case FeeTypeEnum.accountCreationFee: {
        if (this._token) {
          return `${this._token} Account Creation`;
        } else {
          return 'Account creation fee';
        }
      }
      case FeeTypeEnum.orderCreationFee:
        return 'Serum order creation (paid once per pair)';
      case FeeTypeEnum.transactionFee:
        return 'Network fee';
      case FeeTypeEnum.depositWillBeReturned:
        return 'Deposit (will be returned)';
    }
  }
}

export class PayingFee {
  type: FeeType;
  lamports: SolanaSDK.Lamports;
  token: SolanaSDK.Token;

  isFree: boolean;
  info?: PayingFeeInfo | null;

  constructor({
    type,
    lamports,
    token,
    isFree = false,
    info = null,
  }: {
    type: FeeType;
    lamports: SolanaSDK.Lamports;
    token: SolanaSDK.Token;
    isFree?: boolean;
    info?: PayingFeeInfo | null;
  }) {
    this.type = type;
    this.lamports = lamports;
    this.token = token;
    this.isFree = isFree;
    this.info = info;
  }
}

export interface PayingFeeInfo {
  alertTitle: string;
  alertDescription: string;
  payBy?: string;
}

export function networkFeesAll(fees: PayingFee[]): SolanaSDK.FeeAmount | null {
  let transactionFee: u64 | null = null;
  let accountCreationFee: u64 | null = null;
  let depositFee: u64 | null = null;

  for (const fee of fees) {
    switch (fee.type.type) {
      case FeeTypeEnum.transactionFee:
        transactionFee = fee.lamports;
        break;
      case FeeTypeEnum.accountCreationFee:
        accountCreationFee = fee.lamports;
        break;
      case FeeTypeEnum.depositWillBeReturned:
        depositFee = fee.lamports;
        break;
      default:
        break;
    }
  }

  return new SolanaSDK.FeeAmount({
    transaction: transactionFee ?? ZERO,
    accountBalances: accountCreationFee ?? ZERO,
    deposit: depositFee ?? ZERO,
  });
}

export function networkFees(fees: PayingFee[], token: string): SolanaSDK.FeeAmount | null {
  const _fees = fees.filter((fee) => fee.token.symbol === token);

  let transactionFee: u64 | null = null;
  let accountCreationFee: u64 | null = null;
  let depositFee: u64 | null = null;

  for (const fee of _fees) {
    switch (fee.type.type) {
      case FeeTypeEnum.transactionFee:
        transactionFee = fee.lamports;
        break;
      case FeeTypeEnum.accountCreationFee:
        accountCreationFee = fee.lamports;
        break;
      case FeeTypeEnum.depositWillBeReturned:
        depositFee = fee.lamports;
        break;
      default:
        break;
    }
  }

  return new SolanaSDK.FeeAmount({
    transaction: transactionFee ?? ZERO,
    accountBalances: accountCreationFee ?? ZERO,
    deposit: depositFee ?? ZERO,
  });
}

export function transactionFees(fees: PayingFee[], token: string): SolanaSDK.Lamports {
  return fees
    .filter((fee) => fee.type.type === FeeTypeEnum.transactionFee && fee.token.symbol === token)
    .reduce((acc, curr) => acc.add(curr.lamports), new u64(0));
}
