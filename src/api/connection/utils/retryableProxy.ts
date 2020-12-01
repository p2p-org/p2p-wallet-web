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

interface GenericAsyncFunction<T> {
  (...args: Array<never>): Promise<T>;
}

/**
 * Creates a Proxy wraps the function in a retry function.
 * This should be only used if the function is idempotent, i.e. retrying should
 * return the same value and have no side-effects.
 *
 * @param fn
 * @param retryOptions
 */
export const retryableProxy = <U>(
  fn: GenericAsyncFunction<U>,
  retryOptions: Partial<RetryOptions> = defaultRetryOptions,
): GenericAsyncFunction<U> => {
  // combine the passed in options with default options
  const options = mergeLeft(retryOptions, defaultRetryOptions);

  const retryReducer = <T>(
    target: GenericAsyncFunction<T>,
    thisArg: unknown,
    argArray: Array<never>,
  ) => async (previousValue: Promise<T>, currentValue: Promise<T>, currentIndex: number) => {
    const call = async () => target.apply(thisArg, argArray);

    // if it hasn't been called yet, call the function
    if (!previousValue) {
      return call();
    }

    //  if it has been called, and failed, catch the error, wait and retry
    return previousValue.catch((error) => {
      const sleepMs = options.intervalMS * options.backoutMultiplier ** currentIndex;
      console.error(error);
      console.log(`Retrying after ${sleepMs}ms. (Retried ${currentIndex} times)`);

      return sleep(sleepMs).then(call);
    });
  };

  return new Proxy(fn, {
    // trap the "apply" call to the proxied function,
    // in other words, trap the function call itself
    apply: (target, thisArg, argArray) => {
      // reduce over the maximum number of retries.
      // if any of them pass, the code will short-circuit and skip the rest
      return [...new Array(options.count)]
        .reduce(retryReducer(target, thisArg, argArray))
        .catch((error: Error) => {
          console.error('No more retries, throwing.');
          throw error;
        });
    },
  });
};
