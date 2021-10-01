// inspired https://github.com/project-serum/serum-ts/blob/armani/swap2/packages/swap/src/index.ts

import { Program, ProgramError, Provider } from '@project-serum/anchor';
import { parseIdlErrors } from '@project-serum/anchor';
import { SendTxRequest } from '@project-serum/anchor/dist/cjs/provider';
import { TokenListContainer } from '@solana/spl-token-registry';
import { PublicKey, TransactionSignature } from '@solana/web3.js';

import { SWAP_PID } from './constants';
import { createSwap, CreateSwapParams } from './factory/createSwap';
import { SwapDirect } from './factory/direct/direct';
import { SwapTransitive } from './factory/transitive/transitive';
import { IDL } from './idl';
import { SwapMarkets } from './swap-markets';

export class Swap {
  private _program: Program;
  private _swapMarkets: SwapMarkets;
  private _idlErrors: Map<number, string>;

  private _userSwap: SwapDirect | SwapTransitive | null = null;
  // private _feeCompensationSwap: SwapDirect | SwapTransitive | null = null;

  /**
   * @param provider  The wallet and network context to use for the client.
   * @param tokenList The token list providing market addresses for each mint.
   */
  constructor(provider: Provider, tokenList: TokenListContainer) {
    this._program = new Program(IDL, SWAP_PID, provider);
    this._swapMarkets = new SwapMarkets(provider, tokenList);
    this._idlErrors = parseIdlErrors(IDL);
  }

  /**
   * Anchor generated client for the swap program.
   */
  public get program(): Program {
    return this._program;
  }

  /**
   * Token list registry for fetching USD(x) markets for each mint.
   */
  private get swapMarkets(): SwapMarkets {
    return this._swapMarkets;
  }

  /**
   * Returns a list of markets to trade across to swap `fromMint` to `toMint`.
   */
  public route(fromMint: PublicKey, toMint: PublicKey): PublicKey[] | null {
    return this.swapMarkets.route(fromMint, toMint);
  }

  public prepare(
    directParams: CreateSwapParams,
    // feeCompensationParams?: Omit<CreateSwapParams, 'amount'>,
  ): Swap {
    this._userSwap = createSwap(this._program, directParams);

    // if (feeCompensationParams) {
    //   this._feeCompensationSwap = createSwap(this._program, {
    //     ...feeCompensationParams,
    //     amount: this._userSwap.estimate(),
    //   });
    // }

    return this;
  }

  estimate() {
    if (!this._userSwap) {
      throw new Error('Make prepare before estimate');
    }

    let estimatedFee = this._userSwap.estimate();

    // if (this._feeCompensationSwap) {
    //   estimatedFee = estimatedFee.add(this._feeCompensationSwap.estimate());
    // }

    return estimatedFee;
  }

  async swap(): Promise<Array<TransactionSignature>> {
    if (!this._userSwap) {
      throw new Error('Make prepare before swap');
    }

    const txs: SendTxRequest[] = [];

    const userSwapTxs = await this._userSwap.swapTxs();

    txs.push(...userSwapTxs);

    try {
      // await to get instance error and handle it
      return await this._program.provider.sendAll(txs);
    } catch (error) {
      const programError = ProgramError.parse(error, this._idlErrors);
      if (programError) {
        throw programError;
      } else {
        throw error;
      }
    }
  }
}
