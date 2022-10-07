import type { u64 } from '@solana/spl-token';
import promiseRetry from 'promise-retry';

import { convertToBalance } from 'new/sdk/SolanaSDK';

import type { BurnDetails as BurnAndReleaseBurnDetails } from '../../actions/BurnAndRelease';
import { BurnAndRelease } from '../../actions/BurnAndRelease';
import type { RenVMChainType } from '../../chains/RenVMChainType';
import { RenVMError } from '../../models/RenVMError';
import type { RenVMRpcClientType } from '../../RPCClient';
import type { ChainProvider } from '../ChainProvider';
import type { BurnAndReleasePersistentStore } from './BurnAndReleasePersistentStore';

type BurnDetails = BurnAndReleaseBurnDetails;

export class DestinationChain {
  name: string;
  symbol: string;
  decimals: number;

  constructor({ name, symbol, decimals }: { name: string; symbol: string; decimals: number }) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
  }

  static get bitcoin(): DestinationChain {
    return new DestinationChain({ name: 'Bitcoin', symbol: 'BTC', decimals: 8 });
  }
}

class Cache {
  burnAndRelease?: BurnAndRelease;

  save(burnAndRelease: BurnAndRelease): void {
    this.burnAndRelease = burnAndRelease;
  }
}

// The service for burn and release
interface BurnAndReleaseService {
  // Resume on going tasks
  resume(): void;
  // Check if network is testnet
  isTestNet(): boolean;
  // Get fee of burn and release
  getFee(): Promise<number>;
  // Burn and release transaction
  // - Parameters:
  //   - recipient: receiver
  //   - amount: amount to be sent
  // - Returns: transaction signature
  burnAndRelease({ recipient, amount }: { recipient: string; amount: u64 }): Promise<string>;
}

export class BurnAndReleaseServiceImpl implements BurnAndReleaseService {
  // Dependencies

  private readonly _rpcClient: RenVMRpcClientType;
  private _chainProvider: ChainProvider;
  private _destinationChain: DestinationChain;
  private _persistentStore: BurnAndReleasePersistentStore;
  private readonly _version: string;

  // Properties

  private _cache: Cache = new Cache();
  private _chain?: RenVMChainType;

  // Initializer

  constructor({
    rpcClient,
    chainProvider,
    destinationChain,
    persistentStore,
    version,
  }: {
    rpcClient: RenVMRpcClientType;
    chainProvider: ChainProvider;
    destinationChain: DestinationChain;
    persistentStore: BurnAndReleasePersistentStore;
    version: string;
  }) {
    this._rpcClient = rpcClient;
    this._chainProvider = chainProvider;
    this._destinationChain = destinationChain;
    this._persistentStore = persistentStore;
    this._version = version;
  }

  resume(): void {
    (async () => {
      await this._reload();
      await this._releaseUnfinishedTxsFromPersistentStore();
    })();
  }

  isTestNet(): boolean {
    return this._rpcClient.network.isTestnet;
  }

  async getFee(): Promise<number> {
    const lamports = await this._rpcClient.getTransactionFee(this._destinationChain.symbol);
    return convertToBalance(lamports, this._destinationChain.decimals);
  }

  async burnAndRelease({ recipient, amount }: { recipient: string; amount: u64 }): Promise<string> {
    const account = await this._chainProvider.getAccount();
    const burnAndRelease = await this._getBurnAndRelease();
    const burnDetails = await burnAndRelease.submitBurnTransaction({
      account,
      amount: amount.toString(),
      recipient,
    });

    this._persistentStore.persistNonReleasedTransactions(burnDetails);

    const chain = this._chain;
    if (chain) {
      await chain.waitForConfirmation(burnDetails.confirmedSignature);
    }
    const signature = await this._release(burnDetails);

    this._persistentStore.markAsReleased(burnDetails);
    return signature;
  }

  // Private

  private async _reload(): Promise<void> {
    this._chain = await this._chainProvider.load();
    const burnAndRelease = new BurnAndRelease({
      rpcClient: this._rpcClient,
      chain: this._chain,
      mintTokenSymbol: this._destinationChain.symbol,
      version: this._version,
      burnTo: this._destinationChain.name,
    });
    this._cache.save(burnAndRelease);
  }

  private async _releaseUnfinishedTxsFromPersistentStore(): Promise<void> {
    const nonReleasedTransactions = this._persistentStore.getNonReleasedTransactions();
    // TODO: tasks
    await Promise.all(
      nonReleasedTransactions.map(async (detail) => {
        const chain = this._chain;
        if (!chain) {
          throw RenVMError.unknown();
        }

        try {
          await chain.waitForConfirmation(detail.confirmedSignature);
          await this._release(detail);
        } catch (error) {
          console.error(error);
        }
      }),
    );
  }

  private async _release(details: BurnDetails): Promise<string> {
    const burnAndRelease = await this._getBurnAndRelease();
    const state = burnAndRelease.getBurnState(details);

    return promiseRetry(
      async (retry) => {
        return burnAndRelease.release({ state, details }).catch(retry);
      },
      {
        forever: true,
        maxTimeout: 3_000,
      },
    );
  }

  private async _getBurnAndRelease(): Promise<BurnAndRelease> {
    if (!this._cache.burnAndRelease) {
      await this._reload();
    }
    const burnAndRelease = this._cache.burnAndRelease;
    if (burnAndRelease) {
      return burnAndRelease;
    }
    throw RenVMError.other('Could not initialize burn and release service');
  }
}
