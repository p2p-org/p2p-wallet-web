import { OpenOrders } from '@project-serum/serum';

import { useDex } from 'app/contexts/swapSerum/dex';

export function useOpenOrders(): Map<string, Array<OpenOrders>> {
  const ctx = useDex();
  return ctx.openOrders;
}
