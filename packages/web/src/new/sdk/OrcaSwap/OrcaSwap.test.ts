import { Provider } from '@project-serum/anchor';
import { SignerWallet } from '@saberhq/solana-contrib';
import { Connection, Keypair } from '@solana/web3.js';

import { APIEndpoint } from 'new/sdk/SolanaSDK';

import { OrcaSwap, OrcaSwapAPIClient, OrcaSwapSolanaClient } from './index';

jest.setTimeout(50000);

it('OrcaSwap', async () => {
  const endpoint = APIEndpoint.defaultEndpoints[1]!;
  const signer = Keypair.generate();
  const wallet = new SignerWallet(signer);
  const connection = new Connection(endpoint.address);

  const provider = new Provider(connection, wallet, Provider.defaultOptions());

  const apiClient = new OrcaSwapAPIClient('mainnet-beta');
  const solanaClient = new OrcaSwapSolanaClient({ provider, endpoint });
  const orcaSwap = new OrcaSwap(apiClient, solanaClient);

  await orcaSwap.load();

  await expect(
    orcaSwap.getTradablePoolsPairs({
      fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      toMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    }),
  ).resolves.toBeInstanceOf(Array);
});
