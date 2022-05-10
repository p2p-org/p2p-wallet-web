import type { SignaturePubkeyPair, TransactionSignature } from '@solana/web3.js';
import bs58 from 'bs58';

import { FeeRelayerError } from 'app/new/sdk/FeeRelayer/models/FeeRelayerError';

export function getSignature(
  signatures: SignaturePubkeyPair[],
  index: number,
): TransactionSignature {
  if (signatures.length <= index) {
    throw FeeRelayerError.invalidSignature();
  }

  const data = signatures[index]?.signature;
  if (!data) {
    throw FeeRelayerError.invalidSignature();
  }

  return bs58.encode(data);
}
