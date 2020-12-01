export const sleep: (ms: number) => Promise<void> = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
