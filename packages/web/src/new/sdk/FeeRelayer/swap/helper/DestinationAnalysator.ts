import type { PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'new/sdk/FeeRelayer';
import type { FeeRelayerRelaySolanaClient } from 'new/sdk/FeeRelayer/relay';
import { AccountInfo, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

export class DestinationAnalysator {
  static async analyseDestination({
    apiClient,
    destination,
    mint,
    account,
  }: {
    apiClient: FeeRelayerRelaySolanaClient; // TODO: change type
    destination?: PublicKey;
    mint: PublicKey;
    account: PublicKey;
  }): Promise<{
    destination: TokenAccount;
    destinationOwner: PublicKey | null;
    needCreateDestination: boolean;
  }> {
    if (SolanaSDKPublicKey.wrappedSOLMint.equals(mint)) {
      // Target is SOL Token
      return {
        destination: new TokenAccount({ address: account, mint }),
        destinationOwner: account,
        needCreateDestination: true,
      };
    } else {
      // Target is SPL Token
      if (destination) {
        // User already has SPL account
        return {
          destination: new TokenAccount({ address: destination, mint }),
          destinationOwner: account,
          needCreateDestination: false,
        };
      } else {
        // User doesn't have SPL account

        // Try to get associated account
        const address = await apiClient.getAssociatedSPLTokenAddress({
          address: account,
          mint,
        });

        // Check destination address is exist.
        const info = await apiClient.getAccountInfo<AccountInfo | null>({
          account: address.toString(),
          decodedTo: AccountInfo,
        });
        const needsCreateDestinationTokenAccount = !info.owner.equals(
          SolanaSDKPublicKey.tokenProgramId,
        );
        return {
          destination: new TokenAccount({
            address: account,
            mint,
          }),
          destinationOwner: null,
          needCreateDestination: needsCreateDestinationTokenAccount,
        };
      }
    }
  }
}
