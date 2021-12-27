export const titleCase = (sentence: string) => {
  return sentence.replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2');
};
