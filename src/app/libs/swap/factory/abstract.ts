import { Program } from '@project-serum/anchor';
import { SendTxRequest } from '@project-serum/anchor/dist/cjs/provider';
import { Keypair, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

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
