import type { LoadableRelay } from 'new/app/models/LoadableRelay';
import type { FeeInfo, Network } from 'new/scenes/Main/Send';
import type * as FeeRelayer from 'new/sdk/FeeRelayer';
import type { Wallet } from 'new/sdk/SolanaSDK';

export interface NetworkSelectViewModelType {
  readonly payingWallet: Wallet | null;
  readonly feeInfo: LoadableRelay<FeeInfo>;
  network: Network;
  getSelectableNetworks: Network[];
  getFreeTransactionFeeLimit: () => Promise<FeeRelayer.UsageStatus>;
  selectNetwork: (network: Network) => void;
}
