import * as Relay from '../relay/helpers/FeeRelayerRelayModels';
import { FeeRelayerAPIClient } from './FeeRelayerAPIClient';

const pubkey = 'GjMxHDsRz2BabBKbyc3NxGbxBUYug7ujT5JdQ2Eerxfk';

describe('FeeRelayerAPIClient', () => {
  const feeRelayerAPIClient = new FeeRelayerAPIClient(1);

  it('getFeePayerPubkey', async () => {
    expect.assertions(1);

    await expect(feeRelayerAPIClient.getFeePayerPubkey()).resolves.toEqual(
      'FG4Y3yX4AAchp1HvNZ7LfzFTewF2f6nDoMDCohTFrdpT',
    );
  });

  it('requestFreeFeeLimits', async () => {
    const freeFeeLimits = await feeRelayerAPIClient.requestFreeFeeLimits(pubkey);

    expect(freeFeeLimits).toBeInstanceOf(Relay.FeeLimitForAuthorityResponse);
    expect(freeFeeLimits.authority).toBeInstanceOf(Array);
    expect(freeFeeLimits.limits).toBeInstanceOf(Object);
    expect(freeFeeLimits.processedFee).toBeInstanceOf(Object);
  });
});
