import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

import { SOL_MINT } from 'app/contexts/swapSerum';

import { USDC_PUBKEY, USDT_PUBKEY } from '../constants';
import { SwapParams } from '../types';
import { SwapDirect, SwapDirectParams } from './direct';
import { SwapTransitive, SwapTransitiveParams } from './transitive';

function isUsdx(mint: PublicKey) {
  return mint.equals(USDC_PUBKEY) || mint.equals(USDT_PUBKEY);
}

const Side = {
  Bid: { bid: {} },
  Ask: { ask: {} },
};

export type CreateSwapParams = SwapParams & {
  fromWallet: PublicKey;
};

export const createSwap = (
  program: Program,
  {
    fromMint,
    toMint,
    quoteWallet,
    fromWallet,
    toWallet,
    quoteMint,
    fromMarket,
    toMarket,
    amount,
    minExchangeRate,
    referral,
    fromOpenOrders,
    toOpenOrders,
  }: CreateSwapParams,
) => {
  const isSol = fromMint.equals(SOL_MINT) || toMint.equals(SOL_MINT);
  const wrappedSolAccount = isSol ? Keypair.generate() : undefined;
  fromWallet = fromMint.equals(SOL_MINT) ? wrappedSolAccount!.publicKey : fromWallet;
  toWallet = toMint.equals(SOL_MINT) ? wrappedSolAccount!.publicKey : toWallet;

  const paramsWSOL = {
    isSol,
    fromMint,
    wrappedSolAccount,
  };

  // If swapping to/from a USD(x) token, then swap directly on the market.
  if (isUsdx(fromMint)) {
    const params: SwapDirectParams = {
      coinWallet: toWallet,
      pcWallet: fromWallet,
      baseMint: toMint,
      quoteMint: fromMint,
      side: Side.Bid,
      amount,
      minExchangeRate,
      referral,
      fromMarket,
      fromOpenOrders,
    };

    // Special case USDT/USDC market since the coin is always USDT and
    // the pc is always USDC.
    if (toMint.equals(USDC_PUBKEY)) {
      params.coinWallet = fromWallet;
      params.pcWallet = toWallet;
      params.baseMint = fromMint;
      params.quoteMint = toMint;
      params.side = Side.Ask;
    } else if (toMint.equals(USDT_PUBKEY)) {
      params.coinWallet = toWallet;
      params.pcWallet = fromWallet;
      params.baseMint = toMint;
      params.quoteMint = quoteMint;
      params.side = Side.Bid;
    }

    return new SwapDirect(program, paramsWSOL, params);
  }

  if (isUsdx(toMint)) {
    const params: SwapDirectParams = {
      coinWallet: fromWallet,
      pcWallet: toWallet,
      baseMint: fromMint,
      quoteMint: toMint,
      side: Side.Ask,
      amount,
      minExchangeRate,
      referral,
      fromMarket,
      fromOpenOrders,
    };

    return new SwapDirect(program, paramsWSOL, params);
  }

  // Direct swap market explicitly given.
  if (fromMarket && !toMarket) {
    const side = fromMint.equals(fromMarket.baseMintAddress) ? Side.Ask : Side.Bid;

    const params: SwapDirectParams = {
      coinWallet: fromWallet,
      pcWallet: toWallet,
      baseMint: fromMint,
      quoteMint: toMint,
      side,
      amount,
      minExchangeRate,
      referral,
      fromMarket,
      fromOpenOrders,
    };

    return new SwapDirect(program, paramsWSOL, params);
  }

  // Neither wallet is a USD stable coin. So perform a transitive swap.
  if (!quoteMint) {
    throw new Error('quoteMint must be provided for a transitive swap');
  }

  if (!toMarket) {
    throw new Error('toMarket must be provided for transitive swaps');
  }

  const params: SwapTransitiveParams = {
    fromMint,
    toMint,
    pcMint: quoteMint,
    fromWallet,
    toWallet,
    pcWallet: quoteWallet,
    amount,
    minExchangeRate,
    referral,
    fromMarket,
    toMarket,
    fromOpenOrders,
    toOpenOrders,
  };

  return new SwapTransitive(program, paramsWSOL, params);
};
