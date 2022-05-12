import { MockWalletAdaptorService } from '../../__mocks__/services/MockWalletAdaptor';
import { DependencyService } from '../../services/injection/DependencyContext';
import { WalletModel } from '../WalletModel/WalletModel';
import { SolanaModel } from './SolanaModel';

describe('WalletModel should work as expected', function () {
  beforeAll(() => {
    MockWalletAdaptorService.SetTestAdaptorService();
  });
  afterAll(() => {
    MockWalletAdaptorService.RestoreWalletAdaptorService();
  });

  beforeEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.initialize();
  });
  afterEach(() => {
    const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
    walletModel.end();
  });

  it('should load the SolanaModel correctly', async () => {
    const solanaModel = DependencyService.resolve<SolanaModel>(SolanaModel);
    expect(solanaModel, 'solana model should resolve correctly').toBeTruthy();
  });
});
