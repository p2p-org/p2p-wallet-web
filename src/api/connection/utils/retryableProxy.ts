import { mergeLeft } from 'ramda';

import { sleep } from 'utils/common';

type RetryOptions = {
  count: number;
  intervalMS: number;
  backoutMultiplier: number;
};

const defaultRetryOptions: RetryOptions = {
  // max number of retries
  count: 10,
  intervalMS: 200,
  // every retry, multiply the interval by this amount
  backoutMultiplier: 1.5,
};

interface GenericAsyncFunction<U, R> {
  (...args: Array<U>): Promise<R>;
}

/**
 * Creates a Proxy wraps the function in a retry function.
 * This should be only used if the function is idempotent, i.e. retrying should
 * return the same value and have no side-effects.
 *
 * @param fn
 * @param retryOptions
 */
export const retryableProxy = <U, R>(
  fn: GenericAsyncFunction<U, R>,
  retryOptions: Partial<RetryOptions> = defaultRetryOptions,
): GenericAsyncFunction<U, R> => {
  // combine the passed in options with default options
  const options = mergeLeft(retryOptions, defaultRetryOptions);

  const retryReducer = <T>(
    target: GenericAsyncFunction<U, T>,
    thisArg: unknown,
    argArray: Array<U>,
  ) => async (
    previousValue: Promise<T>,
    currentValue: Promise<T>,
    currentIndex: number,
  ): Promise<T> => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const call = async () => target.apply(thisArg, argArray);

    // if it hasn't been called yet, call the function
    if (!previousValue) {
      return call();
    }

    //  if it has been called, and failed, catch the error, wait and retry
    return previousValue.catch((error: Error) => {
      if (!error.message.includes('429 Too Many Requests')) {
        throw error;
      }

      // if (error.message.includes('Transaction simulation failed')) {
      //   throw error;
      // }

      const sleepMs = options.intervalMS * options.backoutMultiplier ** currentIndex;
      console.error(error);
      console.log(`Retrying after ${sleepMs}ms. (Retried ${currentIndex} times)`);

      // eslint-disable-next-line promise/no-nesting
      return sleep(sleepMs).then(call);
    });
  };

  return new Proxy(fn, {
    // trap the "apply" call to the proxied function,
    // in other words, trap the function call itself
    apply: (target, thisArg, argArray) => {
      // reduce over the maximum number of retries.
      // if any of them pass, the code will short-circuit and skip the rest
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      return [...new Array(options.count)]
        .reduce(retryReducer(target, thisArg, argArray))
        .catch((error: Error) => {
          console.error('No more retries, throwing.');
          throw error;
        });
    },
  });
};
