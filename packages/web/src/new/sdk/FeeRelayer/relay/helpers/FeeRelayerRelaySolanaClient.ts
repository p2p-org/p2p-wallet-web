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
import { AccountInfo, SolanaSDK as SolanaSDKClass, SolanaSDKError } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

import * as Relay from '../index';

interface FeeRelayerRelaySolanaClientType {
  getRelayAccountStatus(relayAccountAddress: string): Promise<Relay.RelayAccountStatus>;

  getMinimumBalanceForRentExemption(span: number): Promise<u64>;

  getRecentBlockhash(commitment?: Commitment): Promise<string>;

  getLamportsPerSignature(): Promise<SolanaSDK.Lamports>;

  prepareTransaction({
    instructions,
    signers,
    feePayer,
    accountsCreationFee,
    recentBlockhash,
  }: {
    instructions: TransactionInstruction[];
    signers: Signer[];
    feePayer: PublicKey;
    accountsCreationFee: SolanaSDK.Lamports;
    recentBlockhash?: string | null;
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
  }): Promise<BufferInfo<T>>;
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

  getRelayAccountStatus(relayAccountAddress: string): Promise<Relay.RelayAccountStatus> {
    return this.getAccountInfo<AccountInfo>({
      account: relayAccountAddress,
      decodedTo: AccountInfo,
    })
      .then((accountInfo) => {
        return Relay.RelayAccountStatus.created(new u64(accountInfo.lamports));
      })
      .catch((error: Error) => {
        if (error.message === SolanaSDKError.couldNotRetrieveAccountInfo().message) {
          return Relay.RelayAccountStatus.notYetCreated();
        }

        throw error;
      });
  }
}
