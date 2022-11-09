import type { Network } from '@saberhq/solana-contrib';

import { RemoteConfig } from 'new/services/RemoteConfig';

export function truncatingMiddle(
  text: string,
  {
    numOfSymbolsRevealed = 4,
    numOfSymbolsRevealedInSuffix,
  }: { numOfSymbolsRevealed?: number; numOfSymbolsRevealedInSuffix?: number } = {},
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
  if (text.includes(RemoteConfig.usernameDomain)) {
    return text;
  }

  return `${text}${RemoteConfig.usernameDomain}`;
}

// @web
export const getExplorerUrl = (
  type = 'tx',
  address: string,
  cluster: Network = 'mainnet-beta',
): string => {
  const baseUrlWithAddress = `https://explorer.solana.com/${type}/${address}`;
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return `${baseUrlWithAddress}?cluster=${cluster}`;
    default:
      return baseUrlWithAddress;
  }
};

export const capitalizeFirstLetter = (str?: string): string | undefined => {
  if (!str) {
    return str;
  }
  return `${str[0]!.toUpperCase()}${str.slice(1)}`;
};
