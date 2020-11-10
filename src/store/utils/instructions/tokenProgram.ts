import * as web3 from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

import { TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';

const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    BufferLayout.blob(32, 'mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    BufferLayout.blob(32, 'freezeAuthority'),
  ]),
  'initializeMint',
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(3, BufferLayout.struct([BufferLayout.nu64('amount')]), 'transfer');
LAYOUT.addVariant(7, BufferLayout.struct([BufferLayout.nu64('amount')]), 'mintTo');
LAYOUT.addVariant(8, BufferLayout.struct([BufferLayout.nu64('amount')]), 'burn');
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');

const instructionMaxSpan = Math.max(...Object.values(LAYOUT.registry).map((r) => r.span));

function encodeTokenInstructionData(instruction) {
  const b = Buffer.alloc(instructionMaxSpan);
  const span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

export function initializeMintInstruction({
  mint,
  decimals,
  mintAuthority,
  freezeAuthority,
}: {
  mint: web3.PublicKey;
  decimals: number;
  mintAuthority: web3.PublicKey;
  freezeAuthority?: web3.PublicKey;
}) {
  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  return new web3.TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      initializeMint: {
        decimals,
        mintAuthority: mintAuthority.toBuffer(),
        freezeAuthorityOption: !!freezeAuthority,
        freezeAuthority: (freezeAuthority || new web3.PublicKey()).toBuffer(),
      },
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}

export function initializeAccountInstruction({
  account,
  mint,
  owner,
}: {
  account: web3.PublicKey;
  mint: web3.PublicKey;
  owner: web3.PublicKey;
}) {
  const keys = [
    { pubkey: account, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  return new web3.TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      initializeAccount: {},
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}

export function mintToInstruction({
  mint,
  destination,
  amount,
  mintAuthority,
}: {
  mint: web3.PublicKey;
  destination: web3.PublicKey;
  amount: number;
  mintAuthority: web3.PublicKey;
}) {
  const keys = [
    { pubkey: mint, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
  ];

  return new web3.TransactionInstruction({
    keys,
    data: encodeTokenInstructionData({
      mintTo: {
        amount,
      },
    }),
    programId: TOKEN_PROGRAM_ID,
  });
}
