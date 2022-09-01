const nameServiceDomain = '.p2p.sol';

export function truncatingMiddle(
  text: string,
  {
    numOfSymbolsRevealed = 4,
    numOfSymbolsRevealedInSuffix,
  }: { numOfSymbolsRevealed: number; numOfSymbolsRevealedInSuffix?: number },
): string {
  if (
    text.length <=
    numOfSymbolsRevealed + (numOfSymbolsRevealedInSuffix ?? numOfSymbolsRevealed)
  ) {
    return text;
  }
  return `${text.slice(0, numOfSymbolsRevealed)}...${text.slice(
    -(numOfSymbolsRevealedInSuffix ?? numOfSymbolsRevealed),
  )}`;
}

export function withNameServiceDomain(text: string): string {
  if (text.includes(nameServiceDomain)) {
    return text;
  }

  return `${text}${nameServiceDomain}`;
}
