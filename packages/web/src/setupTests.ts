import type { HasEqual } from 'utils/types';

expect.extend({
  toBeEqualByMethodTo<T extends HasEqual<T>>(received: T, other: T) {
    const equal = received.equals(other);

    return equal
      ? {
          pass: true,
          message: () => `Expected ${received} not to equal ${other}`,
        }
      : {
          pass: false,
          message: () => `Expected ${received} to equal ${other}`,
        };
  },
});
