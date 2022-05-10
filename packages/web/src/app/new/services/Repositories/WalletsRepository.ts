import type { Wallet } from 'app/new/extensions/SolanaSDKWalletExtensions';

export interface WalletsRepository {
  nativeWallet: Wallet | null;
  getWallets(): Wallet[];
  readonly stateObservable: Observable<BEFetcherState>;
  readonlydataDidChange: Observable<void>;
  readonly dataObservable: Observable<Wallet[] | null>;
  getError(): Error | null;
  reload(): void;
  removeItem(predicate: (wallet: Wallet) => boolean): Wallet | null;
  setState(state: BEFetcherState, data: any[] | null): void;
  toggleIsHiddenWalletShown(): void;
  readonly isHiddenWalletsShown: BehaviorRelay<boolean>;
  hiddenWallets(): Wallet[];
  refreshUI(): void;

  batchUpdate(closure: (wallet: Wallet[]) => Wallet[]): void;
}
