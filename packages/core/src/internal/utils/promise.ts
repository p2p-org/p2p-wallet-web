export const withTimeout = <T>(e: Promise<T>, ms?: number | undefined): Promise<T> =>
  new Promise((resolve, reject) => {
    const timout = setTimeout(() => {
      reject('Promise timed out');
    }, ms);

    e.then((result: T) => {
      resolve(result);
      clearTimeout(timout);
    }).catch(reject);
  });
