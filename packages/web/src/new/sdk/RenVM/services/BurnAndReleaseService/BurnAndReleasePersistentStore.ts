import * as BurnAndRelease from '../../actions/BurnAndRelease';

// Persistent store for recovering transaction in case of failure
interface BurnAndReleasePersistentStoreType {
  /// Get last non released transactions for retrying
  /// - Returns: Transactions that wasn't released last time
  getNonReleasedTransactions(): BurnAndRelease.BurnDetails[];

  /// Persist non released transaction for retrying next time
  /// - Parameter transaction: transaction to be persisted
  persistNonReleasedTransactions(transaction: BurnAndRelease.BurnDetails): void;

  /// Mark transaction as released
  /// - Parameter transaction: transaction to be marked
  markAsReleased(transaction: BurnAndRelease.BurnDetails): void;
}

export class BurnAndReleasePersistentStore implements BurnAndReleasePersistentStoreType {
  private readonly _userDefaultKeyForSubmitedBurnTransactions: string;

  constructor({
    userDefaultKeyForSubmitedBurnTransactions,
  }: {
    userDefaultKeyForSubmitedBurnTransactions: string;
  }) {
    this._userDefaultKeyForSubmitedBurnTransactions = userDefaultKeyForSubmitedBurnTransactions;
  }

  getNonReleasedTransactions(): BurnAndRelease.BurnDetails[] {
    const data = this._getFromUserDefault<BurnAndRelease.BurnDetailsJSONType[] | null>(
      this._userDefaultKeyForSubmitedBurnTransactions,
    );
    return data ? data.map((json) => BurnAndRelease.BurnDetails.fromJSON(json)) : [];
  }

  persistNonReleasedTransactions(details: BurnAndRelease.BurnDetails): void {
    let currentValue: BurnAndRelease.BurnDetails[] = (
      this._getFromUserDefault<BurnAndRelease.BurnDetailsJSONType[] | null>(
        this._userDefaultKeyForSubmitedBurnTransactions,
      ) ?? []
    ).map((json) => BurnAndRelease.BurnDetails.fromJSON(json));
    currentValue = currentValue.filter(
      (detail) => detail.confirmedSignature === details.confirmedSignature,
    );
    currentValue.push(details);
    this._saveToUserDefault(currentValue, this._userDefaultKeyForSubmitedBurnTransactions);
  }

  markAsReleased(details: BurnAndRelease.BurnDetails): void {
    let currentValue: BurnAndRelease.BurnDetails[] = (
      this._getFromUserDefault<BurnAndRelease.BurnDetailsJSONType[] | null>(
        this._userDefaultKeyForSubmitedBurnTransactions,
      ) ?? []
    ).map((json) => BurnAndRelease.BurnDetails.fromJSON(json));
    currentValue = currentValue.filter(
      (detail) => detail.confirmedSignature === details.confirmedSignature,
    );
    this._saveToUserDefault(currentValue, this._userDefaultKeyForSubmitedBurnTransactions);
  }

  // Private

  private _getFromUserDefault<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      const session: T = JSON.parse(data!);
      if (!data || !session) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private _saveToUserDefault<T>(value: T, key: string): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
