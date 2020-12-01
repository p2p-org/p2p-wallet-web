import * as web3 from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';

export const SYSTEM_PROGRAM_ID = new web3.PublicKey('11111111111111111111111111111111');

export const TOKEN_PROGRAM_ID = new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export const MEMO_PROGRAM_ID = new web3.PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo');

export const WRAPPED_SOL_MINT = new web3.PublicKey('So11111111111111111111111111111111111111112');

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

export const TOKEN_SWAP_LAYOUT: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u8('isInitialized'),
  BufferLayout.u8('nonce'),
  BufferLayout.blob(32, 'tokenProgramId'),
  BufferLayout.blob(32, 'tokenAccountA'),
  BufferLayout.blob(32, 'tokenAccountB'),
  BufferLayout.blob(32, 'tokenPool'),
  BufferLayout.blob(32, 'mintA'),
  BufferLayout.blob(32, 'mintB'),
  BufferLayout.blob(32, 'feeAccount'),
  BufferLayout.u8('curveType'),
  BufferLayout.blob(8, 'tradeFeeNumerator'),
  BufferLayout.blob(8, 'tradeFeeDenominator'),
  BufferLayout.blob(8, 'ownerTradeFeeNumerator'),
  BufferLayout.blob(8, 'ownerTradeFeeDenominator'),
  BufferLayout.blob(8, 'ownerWithdrawFeeNumerator'),
  BufferLayout.blob(8, 'ownerWithdrawFeeDenominator'),
  BufferLayout.blob(16, 'padding'),
]);
