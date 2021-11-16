export const sleep: (ms: number) => Promise<void> = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const titleCase = (sentence: string) => {
  return sentence.replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2');
};
