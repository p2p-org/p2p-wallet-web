export function bitcoinAddress(isTestnet: boolean): RegExp {
  return new RegExp(`^(${isTestnet ? 'tb1|' : ''}bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$`);
}

export function matches(text: string, regexes: RegExp[]): boolean {
  return regexes.some((regex) => regex.test(text));
}
