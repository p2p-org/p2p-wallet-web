import { Bitcoin } from '@renproject/chains-bitcoin';
import type { RenNetwork } from '@renproject/interfaces';
import { PublicKey } from '@solana/web3.js';

import type { Blockchain } from 'app/contexts';

const SOL_REGEXP = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
const BTC_REGEXP =
  /(bc|tb)(0([ac-hj-np-z02-9]{39}|[ac-hj-np-z02-9]{59})|1[ac-hj-np-z02-9]{8,87})|([13]|[mn2])[a-km-zA-HJ-NP-Z1-9]{25,39}/;

export const isValidAddress = (
  blockchain: Blockchain,
  address: string,
  renNetwork: RenNetwork,
): boolean => {
  return isValidSolanaAddress(address) || isValidBitcoinAddress(address, renNetwork);
};

/*
 * Checks if a given address is a valid Solana address
 */
export const isValidSolanaAddress = (address: string) => {
  if (!SOL_REGEXP.exec(address)) {
    return false;
  }

  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/*
 * Checks if a given address is a valid Bitcoin address
 */
export const isValidBitcoinAddress = (address: string, renNetwork: RenNetwork) => {
  if (!BTC_REGEXP.exec(address)) {
    return false;
  }

  return Bitcoin.utils.addressIsValid(address, renNetwork);
};
