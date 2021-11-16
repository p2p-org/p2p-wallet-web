import type { HasEqual } from 'utils/types';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeEqualByMethodTo<T extends HasEqual<T>>(other: T): R;
    }
  }
}
