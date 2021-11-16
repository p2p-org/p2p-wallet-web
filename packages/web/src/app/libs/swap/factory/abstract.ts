import type { Program } from '@project-serum/anchor';
import type { SendTxRequest } from '@project-serum/anchor/dist/cjs/provider';
import type { Keypair, PublicKey } from '@solana/web3.js';
import type BN from 'bn.js';

export type ParamsWSOL = {
  isSol: boolean;
  fromMint: PublicKey;
  wrappedSolAccount: Keypair | undefined;
};

export abstract class SwapAbstract {
  protected constructor(protected _program: Program, protected _paramsWSOL: ParamsWSOL) {}

  abstract estimate(): BN;

  abstract swapTxs(): Promise<SendTxRequest[]>;
}
