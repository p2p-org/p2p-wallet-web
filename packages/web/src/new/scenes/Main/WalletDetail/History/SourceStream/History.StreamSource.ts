/// The result that contains signatureInfo, account and symbol.
import type { ConfirmedSignatureInfo } from '@solana/web3.js';

export type Result = { signatureInfo: ConfirmedSignatureInfo; account: string; symbol: string };

/// The protocol that manages the sequential loading of transaction.
///
/// The ``Result`` type is temporary solution, since the caller need to know more information about transaction (account address or symbol).
/// TODO: Make result more abstract
export abstract class HistoryStreamSource {
  /// Fetches next single transaction that satisfies the configuration.
  ///
  /// - Parameter configuration: the fetching configuration that contains things like filtering
  /// - Returns: A stream of parsed transactions and the error that can be occurred.
  abstract next(configuration: FetchingConfiguration): Promise<Result | null>;

  /// Fetches next sequence of transactions signatures that satisfies the configuration.
  ///
  /// - Parameter configuration: the fetching configuration that contains things like filtering.
  /// - Returns: A current item in stream and move cursor to next item.
  async nextItems(configuration: FetchingConfiguration): Promise<Result[]> {
    const sequence: Result[] = [];

    let item: Result | null = null;
    while ((item = await this.next(configuration))) {
      sequence.push(item);
    }

    return sequence;
  }

  /// Current item that stream's cursor is holding at current moment.
  ///
  /// - Returns: parsed transaction
  abstract currentItem(): Promise<Result | null>;

  /// Resets the stream.
  abstract reset(): Promise<void>;
}

/// The configuration that accepted by `next()` method of `StreamSource`.
export interface FetchingConfiguration {
  /// Fetches transactions until this time. If the timestamp of transaction is after it, the stream will be finished.
  timestampEnd: Date;
}
