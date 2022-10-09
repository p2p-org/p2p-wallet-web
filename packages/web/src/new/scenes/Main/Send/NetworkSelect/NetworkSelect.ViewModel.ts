import type { LoadableRelay } from 'new/app/models/LoadableRelay';
import type { FeeInfo, Network } from 'new/scenes/Main/Send';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type { WalletsRepository } from 'new/services/Repositories';

export interface NetworkSelectViewModelType {
  payingWallet: Wallet | null;
  feeInfo: LoadableRelay<FeeInfo>;
  walletsRepository: WalletsRepository;
  network: Network;
  getSelectableNetworks: Network[];
  getFreeTransactionFeeLimit: () => Promise<FeeRelayer.UsageStatus>;
  selectNetwork: (network: Network) => void;
}
