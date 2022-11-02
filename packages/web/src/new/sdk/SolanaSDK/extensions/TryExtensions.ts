export function trySafe<T, D extends null>(
  fn: () => T,
  defaultValue: D | null = null,
): T | D | null {
  try {
    return fn();
  } catch (e) {
    return defaultValue;
  }
}
