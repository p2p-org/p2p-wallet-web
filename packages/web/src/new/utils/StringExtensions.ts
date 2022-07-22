const nameServiceDomain = '.p2p.sol';

export function withNameServiceDomain(text: string): string {
  if (text.includes(nameServiceDomain)) {
    return text;
  }

  return `${text}${nameServiceDomain}`;
}
