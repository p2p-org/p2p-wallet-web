import errcode from 'err-code';
import { CancellablePromise, pseudoCancellable } from 'real-cancellable-promise';
import type { OperationOptions } from 'retry';
import retry from 'retry';

const hasOwn = Object.prototype.hasOwnProperty;

function isRetryError(err) {
  return err && err.code === 'EPROMISERETRY' && hasOwn.call(err, 'retried');
}

/**
 * A function that is retryable, by having implicitly-bound params for both an error handler and an attempt number.
 *
 * @param retry The retry callback upon any rejection. Essentially throws the error on in the form of a { retried: err }
 * wrapper, and tags it with a 'code' field of value "EPROMISERETRY" so that it is recognised as needing retrying. Call
 * this from the catch() block when you want to retry a rejected attempt.
 * @param attempt The number of the attempt.
 * @returns A Promise for anything (eg. a HTTP response).
 */
type RetryableFn<ResolutionType> = (
  retry: (error: any) => never,
  attempt: number,
) => CancellablePromise<ResolutionType>;

/**
 * Wrap all functions of the object with retry. The params can be entered in either order, just like in the original library.
 *
 * @param fn The function to retry.
 * @param options The options for how long/often to retry the function for.
 * @returns The Promise resolved by the input retryableFn, or rejected (if not retried) from its catch block.
 */
export function cancellablePromiseRetry<ResolutionType>(
  fn: RetryableFn<ResolutionType>,
  options?: OperationOptions,
): CancellablePromise<ResolutionType> {
  const operation = retry.operation(options);

  return pseudoCancellable(
    new Promise(function (resolve, reject) {
      operation.attempt(function (number) {
        CancellablePromise.resolve()
          .then(function () {
            return fn(function (err) {
              if (isRetryError(err)) {
                err = err.retried;
              }

              throw errcode(new Error('Retrying'), 'EPROMISERETRY', { retried: err });
            }, number);
          })
          .then(resolve, function (err) {
            if (isRetryError(err)) {
              err = err.retried;

              if (operation.retry(err || new Error())) {
                return;
              }
            }

            reject(err);
          });
      });
    }),
  );
}
