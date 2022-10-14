import type { Provider } from '@project-serum/anchor';
import { Token as SPLToken, u64 } from '@solana/spl-token';
import type { AccountInfo as BufferInfo, Commitment } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { APIEndpoint, Lamports } from 'new/sdk/SolanaSDK';
import { MintInfo, SolanaSDKError, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export class SolanaAPIClient {
  provider: Provider;

  /// The endpoint that indicates the rpcpool address and network
  endpoint: APIEndpoint;

  constructor({ provider, endpoint }: { provider: Provider; endpoint: APIEndpoint }) {
    this.provider = provider;
    this.endpoint = endpoint;
  }

  // Convenience methods

  async getMinimumBalanceForRentExemption(span: number): Promise<Lamports> {
    return new u64(await this.provider.connection.getMinimumBalanceForRentExemption(span));
  }

  async getRecentBlockhash(commitment?: Commitment): Promise<string> {
    return (await this.provider.connection.getRecentBlockhash(commitment)).blockhash;
  }

  // TODO: observeSignatureStatus

  // Additional methods

  async getMultipleAccounts<T>({
    pubkeys,
    decodedTo,
  }: {
    pubkeys: string[];
    decodedTo: { decode(data: Buffer): T };
  }): Promise<(BufferInfo<T> | null)[]> {
    if (pubkeys.length === 0) {
      return Promise.resolve([]);
    }

    const pubkeysNew = pubkeys.map((pubkey) => new PublicKey(pubkey));
    return (await this.provider.connection.getMultipleAccountsInfo(pubkeysNew)).map((info) => {
      if (!info) {
        return null;
      }

      return {
        ...info,
        data: decodedTo.decode(info.data),
      };
    });
  }

  // TODO: should return Map
  async getMultipleMintDatas({
    mintAddresses,
    programId = SolanaSDKPublicKey.tokenProgramId.toString(),
  }: {
    mintAddresses: string[];
    programId?: string;
  }): Promise<(MintInfo | null)[]> {
    const accounts = await this.getMultipleAccounts<MintInfo>({
      pubkeys: mintAddresses,
      decodedTo: MintInfo,
    });
    if (accounts.some((account) => account?.owner.toString() !== programId)) {
      throw SolanaSDKError.other('Invalid mint owner');
    }

    const result = accounts.map((account) => account?.data ?? null);
    if (result.length !== mintAddresses.length) {
      throw SolanaSDKError.other('Some of mint data are missing');
    }

    return result;
  }

  // TODO: !!!
  async checkIfAssociatedTokenAccountExists(owner: PublicKey, mint: string): Promise<boolean> {
    const mintAddress = new PublicKey(mint);

    const associatedTokenAccount = await SPLToken.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
      mintAddress,
      owner,
    );

    return this.provider.connection
      .getAccountInfo(associatedTokenAccount)
      .then((info) => {
        if (!info) {
          throw SolanaSDKError.couldNotRetrieveAccountInfo();
        }

        const accountInfo = info as unknown as BufferInfo<{ mint: string }>;
        // detect if destination address is already a SPLToken address
        if (accountInfo.data.mint === mint) {
          return true;
        }

        return false;
      })
      .catch((error) => {
        if (error === SolanaSDKError.couldNotRetrieveAccountInfo()) {
          return false;
        }

        throw error;
      });
  }
}
