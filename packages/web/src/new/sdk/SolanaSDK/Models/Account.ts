import type { AccountMeta, PublicKey } from '@solana/web3.js';

// AccountMeta

export function readonly({
  pubkey,
  isSigner,
}: {
  pubkey: PublicKey;
  isSigner: boolean;
}): AccountMeta {
  return {
    pubkey,
    isSigner,
    isWritable: false,
  };
}

export function writable({
  pubkey,
  isSigner,
}: {
  pubkey: PublicKey;
  isSigner: boolean;
}): AccountMeta {
  return {
    pubkey,
    isSigner,
    isWritable: true,
  };
}
