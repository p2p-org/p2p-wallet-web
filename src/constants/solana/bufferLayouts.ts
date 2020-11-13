import * as web3 from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

export const TOKEN_PROGRAM_ID = new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export const MEMO_PROGRAM_ID = new web3.PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo');

export const MINT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(44),
  BufferLayout.u8('decimals'),
  BufferLayout.blob(37),
]);

export const ACCOUNT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(32, 'mint'),
  BufferLayout.blob(32, 'owner'),
  BufferLayout.nu64('amount'),
  BufferLayout.blob(93),
]);
