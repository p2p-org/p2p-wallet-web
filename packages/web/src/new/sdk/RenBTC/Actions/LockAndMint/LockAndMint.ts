import { createAddressArray } from '@renproject/chains-bitcoin/script';
import { hash160 } from '@renproject/chains-bitcoin/utils/utils';
import { generateGHash, generateNHash, generatePHash, generateSHash } from '@renproject/utils';
import { fromHex, toBase64 } from '@renproject/utils/internal/common';

import { LockAndMintSession } from 'new/sdk/RenBTC/Actions/LockAndMint/LockAndMint.Session';
import type { RenVMChainType } from 'new/sdk/RenBTC/Chains/RenVMChainType';
import { MintTransactionInput } from 'new/sdk/RenBTC/Models/MintTransactionInput';
import { RenVMError } from 'new/sdk/RenBTC/Models/RenVMError';
import { State } from 'new/sdk/RenBTC/Models/RenVMState';
import type { Selector } from 'new/sdk/RenBTC/Models/Selector';
import { Direction } from 'new/sdk/RenBTC/Models/Selector';
import type { RenVMRpcClientType } from 'new/sdk/RenBTC/RPCClient/RPCClient';

export type GatewayAddressResponse = {
  gatewayAddress: Uint8Array;
  sendTo: Uint8Array;
  gHash: Uint8Array;
  gPubkey: Uint8Array;
};

export class LockAndMint {
  rpcClient: RenVMRpcClientType;
  chain: RenVMChainType;
  mintTokenSymbol: string;
  version: string;
  destinationAddress: Uint8Array;
  session: LockAndMintSession;

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
    session: LockAndMintSession;
  }) {
    this.rpcClient = rpcClient;
    this.chain = chain;
    this.mintTokenSymbol = mintTokenSymbol;
    this.version = version;
    this.destinationAddress = destinationAddress;

    session = session || new LockAndMintSession({});
    this.session = session;
  }

  async generateGatewayAddress(): Promise<GatewayAddressResponse> {
    const sendTo = this.chain.getAssociatedTokenAddress(
      this.destinationAddress,
      this.mintTokenSymbol,
    );
    const sHash = generateSHash(this._selector(Direction.to).toString());
    const pHash = generatePHash();
    const gHash = generateGHash(pHash, sHash, sendTo, new Buffer(this.session.nonce, 'hex'));

    let gPubkey;
    try {
      gPubkey = await this.rpcClient.selectPublicKey(this.mintTokenSymbol);
    } catch (e) {
      throw new RenVMError("Provider's public key not found");
    }

    const gatewayAddress = createAddressArray(
      hash160(gPubkey),
      gHash,
      Uint8Array.of(this.rpcClient.network.p2shPrefix),
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
    const nonce = fromHex(this.session.nonce);
    const txid = fromHex(reverseHex(transactionHash));
    const nHash = generateNHash(nonce, txid, txIndex);
    const pHash = generatePHash();

    const mintTx = new MintTransactionInput({
      gHash,
      gPubkey,
      nHash,
      nonce,
      amount,
      pHash,
      to: this.chain.dataToAddress(to),
      txIndex,
      txid,
    });

    const txHash = toBase64(mintTx.hash(this._selector(Direction.to), this.version));

    const state = new State({
      gHash,
      gPubkey,
      sendTo: this.chain.dataToAddress(to),
      txid,
      nHash,
      pHash,
      txHash,
      txIndex,
      amount,
    });

    return state;
  }

  async submitMintTransaction(state: State): Promise<string> {
    const selector = this._selector(Direction.to);

    // get input
    const mintTx = new MintTransactionInput({ state, nonce: fromHex(this.session.nonce) });
    const hash = toBase64(mintTx.hash(selector, this.version).base64urlEncodedString());

    // send transaction
    await this.rpcClient.submitTx(hash, selector, this.version, mintTx);

    return hash;
  }

  async mint(state: State, signer: Uint8Array): Promise<{ amountOut?: string; signature: string }> {
    const txHash = state.txHash;
    if (!txHash) {
      throw new RenVMError('txHash not found');
    }

    const response = await this.rpcClient.queryMint(txHash);

    if (response.tx.out.v.revert) {
      throw new RenVMError(response.tx.out.v.revert);
    }

    if (response.txStatus !== 'done') {
      throw RenVMError.paramMissing();
    }

    const amountOut = response.tx.out.v.amount;

    const signature = this.chain.submitMint(
      this.destinationAddress,
      this.mintTokenSymbol,
      signer,
      response,
    );

    return { amountOut, signature };
  }

  private _selector(direction: Direction): Selector {
    return this.chain.selector(this.mintTokenSymbol, direction);
  }
}

const reverseHex = (src: string): string => {
  return (
    src
      .match(/[a-fA-F0-9]{2}/g)
      ?.reverse()
      .join('') ?? ''
  );
};
