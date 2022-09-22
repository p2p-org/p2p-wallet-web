import type { PublicKey } from '@solana/web3.js';

import type { ResponseQueryTxMint } from 'new/sdk/RenBTC/Models/ResponseQueryTxMint';
import type { Direction, Selector } from 'new/sdk/RenBTC/Models/Selector';

export interface RenVMChainType {
  chainName: string;
  getAssociatedTokenAddress: (address: Uint8Array, mintTokenSymbol: string) => Uint8Array;
  dataToAddress: (data: Uint8Array) => string;
  signatureToData: (signature: string) => Uint8Array;

  submitMint: (
    address: Uint8Array,
    mintTokenSymbol: string,
    signer: Uint8Array,
    responceQueryMint: ResponseQueryTxMint,
  ) => string;

  submitBurn: (
    mintTokenSymbol: string,
    account: PublicKey,
    amount: string,
    recipient: string,
    signer: PublicKey,
  ) => Promise<BurnAndRelease.BurnDetails>;

  waitForConfirmation: (signature: string) => Promise<void>;

  isAlreadyMintedError: (error: Error) => boolean;

  selector: (mintTokenSymbol: string, direction: Direction) => Selector;
}
