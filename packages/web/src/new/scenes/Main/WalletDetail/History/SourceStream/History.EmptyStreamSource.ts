import type { FetchingConfiguration, Result } from './History.StreamSource';
import { HistoryStreamSource } from './History.StreamSource';

export class EmptyStreamSource extends HistoryStreamSource {
  // eslint-disable-next-line @typescript-eslint/require-await
  async next(_: FetchingConfiguration): Promise<Result | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async currentItem(): Promise<Result | null> {
    return null;
  }

  async reset() {}
}
