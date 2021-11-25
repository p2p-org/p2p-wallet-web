import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

export const ZERO_DECIMAL = new Decimal(0);

// Arbitrary mint to represent SOL (not wrapped SOL).
export const SOL_MINT = new PublicKey('Ejmc1UB4EsES5oAaRN63SpoxMJidt3ZGBrqrZk49vjTZ');
