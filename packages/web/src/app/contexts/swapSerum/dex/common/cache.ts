import type { Market } from '@project-serum/serum';

export const _MARKET_CACHE = new Map<string, Promise<Market>>();
