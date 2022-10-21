// https://github.dev/renproject/ren-js/blob/5791e7b9ed3a8d64cf8581f78161eb13f218a13f/packages/lib/utils/src/signatureUtils.ts#L27
import { secp256k1n, signatureToBuffer } from '@renproject/utils/build/main/signatureUtils';
import { fromHex, Ox } from '@renproject/utils/internal/common';
import BigNumber from 'bignumber.js';

import { RenVMError } from '../models';

const switchV = (v: number) => (v === 27 ? 28 : 27); // 28 - (v - 27);

const to32Bytes = (bn: BigNumber): Buffer =>
  Buffer.from(fromHex(('0'.repeat(64) + bn.toString(16)).slice(-64)));

export function fixSignatureSimple(data: Buffer): Buffer {
  if (data.length <= 64) {
    throw new RenVMError('Signature is not valid');
  }

  const [r, s, v] = [data.slice(0, 32), data.slice(32, 64), data[64]! % 27];

  let sBN = new BigNumber(Ox(s), 16);
  let vFixed = ((v || 0) % 27) + 27;

  // For a given key, there are two valid signatures for each signed message.
  // We always take the one with the lower `s`.
  // secp256k1n/2 = 57896044618658097711785492504343953926418782139537452191302581570759080747168.5
  if (sBN.gt(secp256k1n.div(2))) {
    // Take s = -s % secp256k1n
    sBN = secp256k1n.minus(sBN);
    // Switch v
    vFixed = switchV(vFixed);
  }

  return signatureToBuffer({
    r,
    s: to32Bytes(sBN),
    v: vFixed,
  });
}
