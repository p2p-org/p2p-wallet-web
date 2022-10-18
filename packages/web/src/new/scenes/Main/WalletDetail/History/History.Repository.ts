import type { ConfirmedSignatureInfo } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import type { SolanaSDK, TransactionInfo } from 'new/sdk/SolanaSDK';

/// The repository that works with transactions.
export interface HistoryTransactionRepository {
  /// Fetches a list of signatures, that belongs to the `address`.
  ///
  /// - Parameters:
  ///   - address: the account address
  ///   - limit: the number of transactions that will be fetched.
  ///   - before: the transaction signature, that indicates the offset of fetching.
  /// - Returns: the list of `SignatureInfo`
  getSignatures({
    address,
    limit,
    before,
  }: {
    address: string;
    limit: number;
    before?: string;
  }): Promise<ConfirmedSignatureInfo[]>;

  /// Fetch all data of the transaction
  ///
  /// - Parameter signature: The transaction signature
  /// - Returns: `TransactionInfo`, that can be parsed later.
  getTransaction(signature: string): Promise<TransactionInfo | null>;
}

export class SolanaTransactionRepository implements HistoryTransactionRepository {
  private _solanaAPIClient: SolanaSDK;

  getSignatures({
    address,
    limit,
    before,
  }: {
    address: string;
    limit: number;
    before?: string;
  }): Promise<ConfirmedSignatureInfo[]> {
    return this._solanaAPIClient.provider.connection.getSignaturesForAddress(
      new PublicKey(address),
      { limit, before },
    );
  }

  getTransaction(signature: string): Promise<TransactionInfo | null> {
    return this._solanaAPIClient.provider.connection.getParsedTransaction(
      signature,
    ) as Promise<TransactionInfo | null>;
  }

  getTransactions(signatures: string[]): Promise<(TransactionInfo | null)[]> {
    return this._solanaAPIClient.provider.connection.getParsedTransactions(signatures) as Promise<
      (TransactionInfo | null)[]
    >;
  }
}

export class CachingTransactionRepository implements HistoryTransactionRepository {
  delegate: HistoryTransactionRepository;

  private _signaturesCache = new InMemoryCache<ConfirmedSignatureInfo[]>(50);
  private _transactionCache = new InMemoryCache<TransactionInfo>(50);

  constructor(delegate: HistoryTransactionRepository) {
    this.delegate = delegate;
  }

  async getTransaction(signature: string): Promise<TransactionInfo | null> {
    // Return from cache
    let transaction: TransactionInfo | undefined | null = this._transactionCache.read(signature);
    if (transaction) {
      return transaction;
    }

    // Fetch and store in cache
    transaction = await this.delegate.getTransaction(signature);
    this._transactionCache.write(signature, transaction!); // TODO: check, i think it can be null

    return transaction;
  }

  async getSignatures({
    address,
    limit,
    before,
  }: {
    address: string;
    limit: number;
    before?: string;
  }): Promise<ConfirmedSignatureInfo[]> {
    const cacheKey = `${address}-${limit}-${before ?? null}`;

    let signatures = this._signaturesCache.read(cacheKey);
    if (signatures) {
      return signatures;
    }

    signatures = await this.delegate.getSignatures({ address, limit, before });
    this._signaturesCache.write(cacheKey, signatures);
    return signatures;
  }
}
