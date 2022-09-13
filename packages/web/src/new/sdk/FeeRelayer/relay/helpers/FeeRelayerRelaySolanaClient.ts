import { u64 } from '@solana/spl-token';
import type {
  AccountInfo as BufferInfo,
  Commitment,
  PublicKey,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js';
import { injectable } from 'tsyringe';

import { SolanaModel } from 'new/models/SolanaModel';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import type { FeeCalculator } from 'new/sdk/SolanaSDK';
import {
  AccountInfo,
  getAssociatedTokenAddressSync,
  SolanaSDK as SolanaSDKClass,
  SolanaSDKPublicKey,
} from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

import { FeeRelayerError } from '../../models';
import * as Relay from '../index';

interface FeeRelayerRelaySolanaClientType {
  getRelayAccountStatus(relayAccountAddress: string): Promise<Relay.RelayAccountStatus>;

  getMinimumBalanceForRentExemption(span: number): Promise<u64>;

  getRecentBlockhash(commitment?: Commitment): Promise<string>;

  getLamportsPerSignature(): Promise<SolanaSDK.Lamports>;

  prepareTransaction({
    owner,
    instructions,
    signers,
    feePayer,
    feeCalculator,
  }: {
    owner: PublicKey;
    instructions: TransactionInstruction[];
    signers?: Signer[];
    feePayer: PublicKey;
    feeCalculator?: FeeCalculator;
  }): Promise<SolanaSDK.PreparedTransaction>;

  findSPLTokenDestinationAddress({
    mintAddress,
    destinationAddress,
  }: {
    mintAddress: string;
    destinationAddress: string;
  }): Promise<SolanaSDK.SPLTokenDestinationAddress>;

  getAccountInfo<T>({
    account,
    decodedTo,
  }: {
    account: string;
    decodedTo: { decode(data: Buffer): T };
  }): Promise<BufferInfo<T> | null>;
}

// TODO: dont use all sdk
@injectable()
export class FeeRelayerRelaySolanaClient
  extends SolanaSDKClass
  implements FeeRelayerRelaySolanaClientType
{
  constructor(protected solanaModel: SolanaModel) {
    super({
      provider: solanaModel.provider,
      endpoint: Defaults.apiEndpoint,
    });
  }

  getLamportsPerSignature(): Promise<SolanaSDK.Lamports> {
    return this.provider.connection.getRecentBlockhash().then((result) => {
      return new u64(result.feeCalculator.lamportsPerSignature);
    });
  }

  async getRelayAccountStatus(relayAccountAddress: string): Promise<Relay.RelayAccountStatus> {
    const account = await this.getAccountInfo<AccountInfo | null>({
      account: relayAccountAddress,
      decodedTo: AccountInfo,
    });
    if (!account) {
      return Relay.RelayAccountStatus.notYetCreated();
    }
    return Relay.RelayAccountStatus.created(new u64(account.lamports));
  }

  /// Retrieves associated SPL Token address for ``address``.
  ///
  /// - Returns: The associated address.
  async getAssociatedSPLTokenAddress({
    address,
    mint,
  }: {
    address: PublicKey;
    mint: PublicKey;
  }): Promise<PublicKey> {
    const account = await this.getAccountInfo<AccountInfo | null>({
      account: address.toString(),
      decodedTo: AccountInfo,
    });

    // The account doesn't exists
    if (!account) {
      return getAssociatedTokenAddressSync(mint, address);
    }

    // The account is already token account
    if (account.data?.mint.equals(mint)) {
      if (account.owner.equals(SolanaSDKPublicKey.programId)) {
        throw FeeRelayerError.wrongAddress();
      }
    }
    return getAssociatedTokenAddressSync(mint, address);
  }
}
