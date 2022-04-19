import { Bitcoin } from '@renproject/chains-bitcoin';
import type { RenNetwork } from '@renproject/interfaces';
import { PublicKey } from '@solana/web3.js';

import type { Blockchain } from 'app/contexts';

const MINIMUM_ADDRESS_CHARACTERS = 40;

export const isValidAddress = (
  blockchain: Blockchain,
  address: string,
  renNetwork: RenNetwork,
): boolean => {
  if (blockchain === 'solana' && address.length >= MINIMUM_ADDRESS_CHARACTERS) {
    try {
      // eslint-disable-next-line no-new
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  return Bitcoin.utils.addressIsValid(address, renNetwork);
};

/*
 * Checks if a given address is a valid Solana address
 */
export const isValidSolanaAddress = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
