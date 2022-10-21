import type { CancellablePromise } from 'real-cancellable-promise';

import type * as BurnAndRelease from '../actions/BurnAndRelease';
import type { Direction, ResponseQueryTxMint } from '../models';
import { Selector } from '../models';

export abstract class RenVMChainType {
  abstract chainName: string;
  abstract getAssociatedTokenAddress({
    address,
    mintTokenSymbol,
  }: {
    address: Uint8Array;
    mintTokenSymbol: string;
  }): Uint8Array; // represent as data, because there might be different encoding methods for various of chains
  abstract dataToAddress(data: Uint8Array): string;

  abstract signatureToData(signature: string): Uint8Array;

  abstract submitMint({
    address,
    mintTokenSymbol,
    account,
    responseQueryMint,
  }: {
    address: Uint8Array;
    mintTokenSymbol: string;
    account: Uint8Array;
    responseQueryMint: ResponseQueryTxMint;
  }): CancellablePromise<string>;

  abstract submitBurn({
    mintTokenSymbol,
    account,
    amount,
    recipient,
  }: {
    mintTokenSymbol: string;
    account: Uint8Array;
    amount: string;
    recipient: string;
  }): Promise<BurnAndRelease.BurnDetails>;

  abstract waitForConfirmation(signature: string): Promise<void>;

  abstract isAlreadyMintedError(error: Error): boolean;

  // extension

  selector({
    mintTokenSymbol,
    direction,
  }: {
    mintTokenSymbol: string;
    direction: Direction;
  }): Selector {
    return new Selector({ mintTokenSymbol, chainName: this.chainName, direction });
  }
}
