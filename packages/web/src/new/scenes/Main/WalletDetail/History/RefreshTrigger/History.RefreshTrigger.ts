/// Refreshing history depends on coming signal.
import type { IReactionDisposer } from 'mobx';

export interface HistoryRefreshTrigger {
  /// Registers a trigger
  ///
  /// - Returns: A stream of refreshing signal
  register(cb: () => void): IReactionDisposer;
}
