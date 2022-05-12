export function delayExec<T>(func: () => T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(func());
    }, ms);
  });
}
