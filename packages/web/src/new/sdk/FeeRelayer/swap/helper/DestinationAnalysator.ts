import type { PublicKey } from '@solana/web3.js';

import { AccountInfo, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import { TokenAccount } from '../../models/TokenAccount';
import type { FeeRelayerRelaySolanaClient } from '../../relay';

export class DestinationAnalysator {
  static async analyseDestination({
    apiClient,
    destination,
    mint,
    userAccount,
  }: {
    apiClient: FeeRelayerRelaySolanaClient; // TODO: change type
    destination?: PublicKey | null;
    mint: PublicKey;
    userAccount: PublicKey;
  }): Promise<{
    destination: TokenAccount;
    destinationOwner: PublicKey | null;
    needCreateDestination: boolean;
  }> {
    if (SolanaSDKPublicKey.wrappedSOLMint.equals(mint)) {
      // Target is SOL Token
      return {
        destination: new TokenAccount({ address: userAccount, mint }),
        destinationOwner: userAccount,
        needCreateDestination: true,
      };
    } else {
      // Target is SPL Token
      if (destination) {
        // User already has SPL account
        return {
          destination: new TokenAccount({ address: destination, mint }),
          destinationOwner: userAccount,
          needCreateDestination: false,
        };
      } else {
        // User doesn't have SPL account

        // Try to get associated account
        const address = await apiClient.getAssociatedSPLTokenAddress({
          address: userAccount,
          mint,
        });

        // Check destination address is exist.
        const info = await apiClient.getAccountInfo<AccountInfo | null>({
          account: address.toString(),
          decodedTo: AccountInfo,
        });
        const needsCreateDestinationTokenAccount = !info?.owner.equals(
          SolanaSDKPublicKey.tokenProgramId,
        );
        return {
          destination: new TokenAccount({
            address: userAccount,
            mint,
          }),
          destinationOwner: null,
          needCreateDestination: needsCreateDestinationTokenAccount,
        };
      }
    }
  }
}
