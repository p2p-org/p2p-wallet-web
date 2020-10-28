export function asyncTimeout(ms: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
