import { generateGHash, generateNHash, generatePHash, generateSHash } from '@renproject/utils';
import { toURLBase64 } from '@renproject/utils/internal/common';
import type { u64 } from '@solana/spl-token';
import bech32 from 'bech32';
import BN from 'bn.js';
import base58 from 'bs58';

import type { RenVMChainType } from '../chains/RenVMChainType';
import type { State } from '../models';
import { Direction, MintTransactionInput, Selector } from '../models';
import type { RenVMRpcClientType } from '../RPCClient';

export interface BurnDetails {
  confirmedSignature: string;
  nonce: u64;
  recipient: string;
  amount: string;
}

export class BurnAndRelease {
  private _rpcClient: RenVMRpcClientType;
  private _chain: RenVMChainType;
  private _mintTokenSymbol: string;
  private _version: string;
  private _burnToChainName: string; // Ex.: Bitcoin

  constructor({
    rpcClient,
    chain,
    mintTokenSymbol,
    version,
    burnTo,
  }: {
    rpcClient: RenVMRpcClientType;
    chain: RenVMChainType;
    mintTokenSymbol: string;
    version: string;
    burnTo: string;
  }) {
    this._rpcClient = rpcClient;
    this._chain = chain;
    this._mintTokenSymbol = mintTokenSymbol;
    this._version = version;
    this._burnToChainName = burnTo;
  }

  submitBurnTransaction({
    account,
    amount,
    recipient,
    signer,
  }: {
    account: Buffer;
    amount: string;
    recipient: string;
    signer: Buffer;
  }): Promise<BurnDetails> {
    return this._chain.submitBurn({
      mintTokenSymbol: this._mintTokenSymbol,
      account,
      amount,
      recipient,
      signer,
    });
  }

  getBurnState(burnDetails: BurnDetails): State {
    const txid = this._chain.signatureToData(burnDetails.confirmedSignature);
    const nonceBuffer = this._getNonceBuffer(new BN(burnDetails.nonce));
    const nHash = generateNHash(nonceBuffer, txid, '0');
    const pHash = generatePHash();
    const sHash = generateSHash(
      new Selector({
        mintTokenSymbol: this._mintTokenSymbol,
        chainName: this._burnToChainName,
        direction: Direction.to,
      }).toString(),
    );
    const gHash = generateGHash(
      pHash,
      sHash,
      BurnAndRelease.addressToBytes(burnDetails.recipient),
      nonceBuffer,
    );

    const mintTx = MintTransactionInput.fromBuffer({
      gHash,
      gPubkey: new Uint8Array(),
      nHash,
      nonce: nonceBuffer,
      amount: burnDetails.amount,
      pHash,
      to: burnDetails.recipient,
      txIndex: '0',
      txid,
    });

    const txHash = toURLBase64(
      mintTx.hash({
        selector: this._chain.selector({
          mintTokenSymbol: this._mintTokenSymbol,
          direction: Direction.from,
        }),
        version: this._version,
      }),
    );

    return {
      sendTo: burnDetails.recipient,
      txIndex: '0',
      amount: burnDetails.amount,
      nHash,
      txid,
      pHash,
      gHash,
      txHash,
      gPubkey: new Uint8Array(),
    };
  }

  async release(state: State, details: BurnDetails): Promise<string> {
    const selector = this._selector(Direction.from);
    const nonceBuffer = this._getNonceBuffer(new BN(details.nonce));

    // get input
    const mintTx = MintTransactionInput.fromState({ state, nonce: nonceBuffer });
    const hash = toURLBase64(mintTx.hash({ selector, version: this._version }));

    // send transaction
    await this._rpcClient.submitTx({
      hash,
      selector,
      version: this._version,
      input: mintTx,
    });
    return hash;
  }

  private _getNonceBuffer(nonce: BN) {
    return new BN(nonce.toString()).toArrayLike(Buffer, 'be', 32);
  }

  private _selector(direction: Direction): Selector {
    return this._chain.selector({
      mintTokenSymbol: this._mintTokenSymbol,
      direction,
    });
  }

  static addressToBytes(address: string): Buffer {
    // Attempt to decode address as a bech32 address, and if that fails
    // fall back to base58.
    try {
      const [type, ...words] = bech32.decode(address).words;
      return Buffer.concat([Buffer.from([type!]), Buffer.from(bech32.fromWords(words))]);
    } catch (error) {
      try {
        return base58.decode(address);
      } catch (internalError) {
        throw new Error(`Unrecognized address format "${address}".`);
      }
    }
  }
}
