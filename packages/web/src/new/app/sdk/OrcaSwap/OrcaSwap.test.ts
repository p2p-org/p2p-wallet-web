import { SignerWallet, SolanaProvider } from '@saberhq/solana-contrib';
import { Connection, Keypair } from '@solana/web3.js';

import { OrcaSwap, OrcaSwapAPIClient, OrcaSwapSolanaClient } from './index';

it('OrcaSwap', async () => {
  const signer = Keypair.generate();
  const wallet = new SignerWallet(signer);
  const connection = new Connection('https://p2p.rpcpool.com/');

  const provider = SolanaProvider.load({
    connection,
    sendConnection: connection,
    wallet,
  });

  const apiClient = new OrcaSwapAPIClient('mainnet-beta');
  const solanaClient = new OrcaSwapSolanaClient({ provider });
  const orcaSwap = new OrcaSwap(apiClient, solanaClient);

  orcaSwap.load();

  await expect(
    orcaSwap.getTradablePoolsPairs({
      fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      toMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    }),
  ).resolves.toBeInstanceOf(Array);
});
