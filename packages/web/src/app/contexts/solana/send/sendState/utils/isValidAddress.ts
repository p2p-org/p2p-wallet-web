import { Bitcoin } from '@renproject/chains-bitcoin';
import type { RenNetwork } from '@renproject/interfaces';
import { PublicKey } from '@solana/web3.js';

import type { Blockchain } from 'app/contexts';

export const isValidAddress = (
  blockchain: Blockchain,
  address: string,
  renNetwork: RenNetwork,
): boolean => {
  if (blockchain === 'solana' && address.length >= 40) {
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
