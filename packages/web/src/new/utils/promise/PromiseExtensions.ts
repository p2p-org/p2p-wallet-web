import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { CancellablePromise, Cancellation } from 'real-cancellable-promise';

export function cancellableAxios<T>(
  config: AxiosRequestConfig,
): CancellablePromise<AxiosResponse<T>> {
  const source = axios.CancelToken.source();
  config = { ...config, cancelToken: source.token };

  const promise = axios(config)
    .then((response) => response)
    .catch((e) => {
      if (e instanceof axios.Cancel) {
        throw new Cancellation();
      }

      // rethrow the original error
      throw e;
    });

  return new CancellablePromise<AxiosResponse<T>>(promise, () => source.cancel());
}

export function cancellableFetch(
  input: RequestInfo,
  init: RequestInit = {},
): CancellablePromise<Response> {
  const controller = new AbortController();

  const promise = fetch(input, {
    ...init,
    signal: controller.signal,
  }).catch((e) => {
    if (e.name === 'AbortError') {
      throw new Cancellation();
    }

    // rethrow the original error
    throw e;
  });

  return new CancellablePromise<Response>(promise, () => controller.abort());
}
