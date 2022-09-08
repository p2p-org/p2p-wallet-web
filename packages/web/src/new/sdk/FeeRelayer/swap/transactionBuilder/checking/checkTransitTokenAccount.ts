import type { BuildContext } from 'new/sdk/FeeRelayer';
import { TransitTokenAccountAnalysator } from 'new/sdk/FeeRelayer';

export async function checkTransitTokenAccount(context: BuildContext): Promise<void> {
  const transitToken = TransitTokenAccountAnalysator.getTransitToken({
    solanaApiClient: context.solanaApiClient,
    orcaSwap: context.orcaSwap,
    account: context.config.userAccount,
    pools: context.config.pools,
  });

  const needsCreateTransitTokenAccount =
    await TransitTokenAccountAnalysator.checkIfNeedsCreateTransitTokenAccount({
      solanaApiClient: context.solanaApiClient,
      transitToken,
    });

  context.env.needsCreateTransitTokenAccount = needsCreateTransitTokenAccount;
  context.env.transitTokenAccountAddress = transitToken?.address;
  context.env.transitTokenMintPubkey = transitToken?.mint;
}
