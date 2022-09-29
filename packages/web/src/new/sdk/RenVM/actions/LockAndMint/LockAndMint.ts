import { createAddressArray } from '@renproject/chains-bitcoin/script';
import { hash160 } from '@renproject/chains-bitcoin/utils/utils';
import { generateGHash, generateNHash, generatePHash, generateSHash } from '@renproject/utils';
import { fromHex } from '@renproject/utils/internal/common';
import { toURLBase64 } from '@renproject/utils/module/internal/common';
import type { CancellablePromise } from 'real-cancellable-promise';
import { buildCancellablePromise } from 'real-cancellable-promise';

import type { RenVMChainType } from '../../chains/RenVMChainType';
import type { Selector, State } from '../../models';
import { Direction, MintTransactionInput, RenVMError } from '../../models';
import type { RenVMRpcClientType } from '../../RPCClient/RPCClient';
import { Session } from './LockAndMint.Session';

export interface GatewayAddressResponse {
  gatewayAddress: Uint8Array;
  sendTo: Uint8Array;
  gHash: Uint8Array;
  gPubkey: Uint8Array;
}

export class LockAndMint {
  // Dependencies
  private _rpcClient: RenVMRpcClientType;
  private _chain: RenVMChainType;
  private _mintTokenSymbol: string;
  private _version: string;
  private _destinationAddress: Uint8Array;

  // State
  private _session: Session;

  constructor({
    rpcClient,
    chain,
    mintTokenSymbol,
    version,
    destinationAddress,
    session,
  }: {
    rpcClient: RenVMRpcClientType;
    chain: RenVMChainType;
    mintTokenSymbol: string;
    version: string;
    destinationAddress: Uint8Array;
    session: Session | null;
  }) {
    this._rpcClient = rpcClient;
    this._chain = chain;
    this._mintTokenSymbol = mintTokenSymbol;
    this._version = version;
    this._destinationAddress = destinationAddress;

    if (session) {
      this._session = session;
    } else {
      this._session = new Session();
    }
  }

  async generateGatewayAddress(): Promise<GatewayAddressResponse> {
    const sendTo = this._chain.getAssociatedTokenAddress({
      address: this._destinationAddress,
      mintTokenSymbol: this._mintTokenSymbol,
    });
    const tokenGatewayContractHex = generateSHash(this._selector(Direction.to).toString());
    const gHash = generateGHash(
      generatePHash(),
      tokenGatewayContractHex,
      sendTo,
      fromHex(this._session.nonce),
    );

    const gPubkey = await this._rpcClient.selectPublicKey(this._mintTokenSymbol);

    if (!gPubkey) {
      throw new RenVMError("Provider's public key not found");
    }

    const gatewayAddress = createAddressArray(
      hash160(gPubkey),
      gHash,
      Uint8Array.from([this._rpcClient.network.p2shPrefix]),
    );

    return { gatewayAddress, sendTo, gHash, gPubkey };
  }

  getDepositState({
    transactionHash,
    txIndex,
    amount,
    to,
    gHash,
    gPubkey,
  }: {
    transactionHash: string;
    txIndex: string;
    amount: string;
    to: Uint8Array;
    gHash: Uint8Array;
    gPubkey: Uint8Array;
  }): State {
    const nonce = fromHex(this._session.nonce);
    const txid = fromHex(reverseHex(transactionHash));
    const nHash = generateNHash(nonce, txid, txIndex ?? '0');
    const pHash = generatePHash();

    const mintTx = MintTransactionInput.fromBuffer({
      gHash,
      gPubkey,
      nHash,
      nonce,
      amount,
      pHash,
      to: this._chain.dataToAddress(to),
      txIndex,
      txid,
    });

    const txHash = toURLBase64(
      mintTx.hash({ selector: this._selector(Direction.to), version: this._version }),
    );

    const state: State = {
      gHash,
      gPubkey,
      sendTo: this._chain.dataToAddress(to),
      txid,
      nHash,
      pHash,
      txHash,
      txIndex,
      amount,
    };

    return state;
  }

  submitMintTransaction(state: State): CancellablePromise<string> {
    return buildCancellablePromise(async (capture) => {
      const selector = this._selector(Direction.to);

      // get input
      const mintTx = MintTransactionInput.fromState({ state, nonce: fromHex(this._session.nonce) });
      const hash = toURLBase64(mintTx.hash({ selector, version: this._version }));

      // send transaction
      await capture(
        this._rpcClient.submitTx({
          hash,
          selector,
          version: this._version,
          input: mintTx,
        }),
      );

      return hash;
    });
  }

  mint({
    state,
    account,
  }: {
    state: State;
    account: Uint8Array;
  }): CancellablePromise<{ amountOut?: string; signature: string }> {
    return buildCancellablePromise(async (capture) => {
      const txHash = state.txHash;
      if (!txHash) {
        throw new RenVMError('txHash not found');
      }

      const response = await capture(this._rpcClient.queryMint(txHash));

      const revert = response.tx.out.v.revert;
      if (revert) {
        throw new RenVMError(revert);
      }

      if (response.txStatus !== 'done') {
        throw RenVMError.paramsMissing();
      }

      const amountOut = response.tx.out.v.amount;

      const signature = await capture(
        this._chain.submitMint({
          address: this._destinationAddress,
          mintTokenSymbol: this._mintTokenSymbol,
          account,
          responseQueryMint: response,
        }),
      );

      return { amountOut, signature };
    });
  }

  private _selector(direction: Direction): Selector {
    return this._chain.selector({ mintTokenSymbol: this._mintTokenSymbol, direction });
  }
}

function reverseHex(src: string): string {
  return (
    src
      .match(/[a-fA-F0-9]{2}/g)
      ?.reverse()
      .join('') ?? ''
  );
}
