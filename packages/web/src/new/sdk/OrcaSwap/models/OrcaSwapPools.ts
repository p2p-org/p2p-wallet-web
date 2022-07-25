import type { u64 } from '@solana/spl-token';
import type { PublicKey, Signer } from '@solana/web3.js';

import type { Lamports } from 'new/sdk/SolanaSDK';
import { AccountInstructions, TokenAccountBalance } from 'new/sdk/SolanaSDK';
import { toLamport } from 'new/sdk/SolanaSDK/extensions/NumberExtensions';

import type { OrcaSwapSolanaClient } from '../apiClient/OrcaSwapSolanaClient';
import { OrcaSwapError } from './OrcaSwapError';
import { OrcaSwapInterTokenInfo } from './OrcaSwapInterTokenInfo';
import type { OrcaSwapPool } from './OrcaSwapPool';
import { OrcaSwapTokenName } from './OrcaSwapPool';
import type { OrcaSwapRoute } from './OrcaSwapRoute';
import type { OrcaSwapTokens } from './OrcaSwapToken';

export type Pools = Record<string, OrcaSwapPool>;
export type PoolsPair = OrcaSwapPool[];

// TODO: @web need to be clear on network change
const balancesCache: { [address in string]: TokenAccountBalance } = {};

/// Pools

// TODO: @web check mutation by reference
async function fixedPool({
  pools,
  path,
  solanaClient,
}: {
  pools: Pools;
  path: string; // Ex. BTC/SOL[aquafarm][stable]
  solanaClient: OrcaSwapSolanaClient;
}): Promise<OrcaSwapPool | null> {
  const pool = pools[path];
  if (!pool) {
    return Promise.resolve(null);
  }

  if (path.includes('[stable]')) {
    pool.isStable = true;
  }

  // get balances
  const tokenABalance = pool.tokenABalance ?? balancesCache[pool.tokenAccountA.toString()];
  const tokenBBalance = pool.tokenBBalance ?? balancesCache[pool.tokenAccountB.toString()];

  if (tokenABalance && tokenBBalance) {
    pool.tokenABalance = tokenABalance;
    pool.tokenBBalance = tokenBBalance;
    return Promise.resolve(pool);
  }

  // TODO: multiple request and once
  const getBalancesRequest = Promise.all([
    solanaClient.getTokenAccountBalance(pool.tokenAccountA),
    solanaClient.getTokenAccountBalance(pool.tokenAccountB),
  ]);

  return getBalancesRequest.then(([resTokenABalance, resTokenBBalance]) => {
    const tokenABalanceNew = new TokenAccountBalance(resTokenABalance.value);
    const tokenBBalanceNew = new TokenAccountBalance(resTokenBBalance.value);

    balancesCache[pool.tokenAccountA.toString()] = tokenABalanceNew;
    balancesCache[pool.tokenAccountB.toString()] = tokenBBalanceNew;

    pool.tokenABalance = tokenABalanceNew;
    pool.tokenBBalance = tokenBBalanceNew;
    return pool;
  });
}

export async function getPools({
  pools,
  route,
  fromTokenName,
  toTokenName,
  solanaClient,
}: {
  pools: Pools;
  route: OrcaSwapRoute;
  fromTokenName: string;
  toTokenName: string;
  solanaClient: OrcaSwapSolanaClient;
}): Promise<OrcaSwapPool[]> {
  if (!route.length) {
    return [];
  }

  const requests = Promise.all(route.map((path) => fixedPool({ pools, path, solanaClient })));

  return requests.then((resPools) => {
    const cleanPools = resPools.filter(Boolean) as OrcaSwapPool[];

    // modify orders
    if (cleanPools.length === 2) {
      // reverse order of the 2 pools
      // Ex: Swap from SOCN -> BTC, but paths are
      // [
      //     "BTC/SOL[aquafarm]",
      //     "SOCN/SOL[stable][aquafarm]"
      // ]
      // Need to change to
      // [
      //     "SOCN/SOL[stable][aquafarm]",
      //     "BTC/SOL[aquafarm]"
      // ]

      if (
        cleanPools[0]!.tokenAName.toString() !== fromTokenName &&
        cleanPools[0]!.tokenBName.toString() !== fromTokenName
      ) {
        const temp = cleanPools[0]!;
        cleanPools[0] = cleanPools[1]!;
        cleanPools[1] = temp;
      }
    }

    // reverse token A and token B in pool if needed
    for (let i = 0; i < cleanPools.length; i++) {
      if (i === 0) {
        let pool = cleanPools[0]!;
        if (
          pool.tokenAName.fixedTokenName !== new OrcaSwapTokenName(fromTokenName).fixedTokenName
        ) {
          pool = pool.reversed;
        }
        cleanPools[0] = pool;
      }

      if (i === 1) {
        let pool = cleanPools[1]!;
        if (pool.tokenBName.fixedTokenName !== new OrcaSwapTokenName(toTokenName).fixedTokenName) {
          pool = pool.reversed;
        }
        cleanPools[1] = pool;
      }
    }

    return cleanPools;
  });
}

// PoolsPair
export function constructExchange({
  pools,
  tokens,
  solanaClient,
  owner,
  fromTokenPubkey,
  intermediaryTokenAddress,
  toTokenPubkey,
  amount,
  slippage,
  feePayer,
  minRentExemption,
}: {
  pools: PoolsPair;
  tokens: OrcaSwapTokens;
  solanaClient: OrcaSwapSolanaClient;
  owner: Signer;
  fromTokenPubkey: string;
  intermediaryTokenAddress?: string;
  toTokenPubkey?: string;
  amount: u64;
  slippage: number;
  feePayer?: PublicKey | null;
  minRentExemption: u64;
}): Promise<[AccountInstructions, Lamports /*account creation fee*/]> {
  if (!pools.length || pools.length > 2) {
    throw OrcaSwapError.invalidPool();
  }

  if (pools.length === 1) {
    // direct swap
    return pools[0]!
      .constructExchange({
        tokens,
        solanaClient,
        owner,
        fromTokenPubkey,
        intermediaryTokenAddress,
        toTokenPubkey,
        amount,
        slippage,
        feePayer,
        minRentExemption,
      })
      .then(([accountInstructions, accountCreationFee]) => [
        accountInstructions,
        accountCreationFee,
      ]);
  } else {
    // transitive swap
    if (!intermediaryTokenAddress) {
      throw OrcaSwapError.intermediaryTokenAddressNotFound();
    }

    return pools[0]!
      .constructExchange({
        tokens,
        solanaClient,
        owner,
        fromTokenPubkey,
        toTokenPubkey: intermediaryTokenAddress,
        amount,
        slippage,
        feePayer,
        minRentExemption,
      })
      .then(([pool0AccountInstructions, pool0AccountCreationFee]) => {
        const minAmountOut = pools[0]!.getMinimumAmountOut(amount, slippage);
        // TOOD: check
        // if (!minAmountOut) {
        //   throw OrcaSwapError.unknown();
        // }

        return pools[1]!
          .constructExchange({
            tokens,
            solanaClient,
            owner,
            fromTokenPubkey: intermediaryTokenAddress,
            toTokenPubkey,
            amount: minAmountOut,
            slippage,
            feePayer,
            minRentExemption,
          })
          .then(([pool1AccountInstructions, pool1AccountCreationFee]) => {
            return [
              new AccountInstructions({
                account: pool1AccountInstructions.account,
                instructions: pool0AccountInstructions.instructions.concat(
                  pool1AccountInstructions.instructions,
                ),
                cleanupInstructions: pool0AccountInstructions.cleanupInstructions.concat(
                  pool1AccountInstructions.cleanupInstructions,
                ),
                signers: pool0AccountInstructions.signers.concat(pool1AccountInstructions.signers),
              }),
              pool0AccountCreationFee.add(pool1AccountCreationFee),
            ];
          });
      });
  }
}

export function getOutputAmount(pools: PoolsPair, inputAmount: u64): u64 | null {
  if (!pools.length) {
    return null;
  }

  const pool0 = pools[0];

  const estimatedAmountOfPool0 = pool0?.getOutputAmount(inputAmount);
  if (!estimatedAmountOfPool0) {
    return null;
  }

  // direct
  if (pools.length === 1) {
    return estimatedAmountOfPool0;
  }
  // transitive
  else {
    const pool1 = pools[1];
    const estimatedAmountOfPool1 = pool1?.getOutputAmount(estimatedAmountOfPool0);
    if (!estimatedAmountOfPool1) {
      return null;
    }

    return estimatedAmountOfPool1;
  }
}

export function getInputAmount(pools: PoolsPair, estimatedAmount: u64): u64 | null {
  if (!pools.length) {
    return null;
  }

  // direct
  if (pools.length === 1) {
    const pool0 = pools[0];

    const inputAmountOfPool0 = pool0?.getInputAmount(estimatedAmount);
    if (!inputAmountOfPool0) {
      return null;
    }

    return inputAmountOfPool0;
  }
  // transitive
  else {
    const pool1 = pools[1];

    const inputAmountOfPool1 = pool1?.getInputAmount(estimatedAmount);
    if (!inputAmountOfPool1) {
      return null;
    }

    const pool0 = pools[0];

    const inputAmountOfPool0 = pool0?.getInputAmount(inputAmountOfPool1);
    if (!inputAmountOfPool0) {
      return null;
    }

    return inputAmountOfPool0;
  }
}

export function getInputAmountSlippage(
  pools: PoolsPair,
  minimumAmountOut: u64,
  slippage: number,
): u64 | null {
  if (!pools.length) {
    return null;
  }

  const pool0 = pools[0];
  //direct
  if (pools.length === 1) {
    const inputAmount = pool0?.getInputAmountSlippage(minimumAmountOut, slippage);
    if (!inputAmount) {
      return null;
    }
    return inputAmount;
  }
  // transitive
  else {
    const pool1 = pools[1];
    const inputAmountPool1 = pool1?.getInputAmountSlippage(minimumAmountOut, slippage);
    if (!inputAmountPool1) {
      return null;
    }
    const inputAmountPool0 = pool0?.getInputAmountSlippage(inputAmountPool1, slippage);
    if (!inputAmountPool0) {
      return null;
    }
    return inputAmountPool0;
  }
}

export function getIntermediaryToken(
  pools: PoolsPair,
  inputAmount: u64,
  slippage: number,
): OrcaSwapInterTokenInfo | null {
  if (pools.length <= 1) {
    return null;
  }

  const pool0 = pools[0]!;

  return new OrcaSwapInterTokenInfo({
    tokenName: pool0.tokenBName.toString(),
    outputAmount: pool0.getOutputAmount(inputAmount),
    minAmountOut: pool0.getMinimumAmountOut(inputAmount, slippage),
    isStableSwap: pools[1]!.isStable === true,
  });
}

export function calculateLiquidityProviderFees(
  pools: PoolsPair,
  inputAmount: number,
  slippage: number,
): u64[] {
  if (!pools.length || pools.length <= 1) {
    return [];
  }

  const pool0 = pools[0];

  const sourceDecimals = pool0?.tokenABalance?.decimals;
  if (!sourceDecimals) {
    throw OrcaSwapError.unknown();
  }

  const inputAmount0 = toLamport(inputAmount, sourceDecimals);

  // 1 pool
  const result: u64[] = [];
  const fee0 = pool0.calculatingFees(inputAmount0);
  result.push(fee0);

  // 2 pool
  if (pools.length === 2) {
    const pool1 = pools[1]!;
    const inputAmount1 = pool0.getMinimumAmountOut(inputAmount0, slippage);
    if (inputAmount1) {
      const fee1 = pool1.calculatingFees(inputAmount1);
      result.push(fee1);
    }
  }

  return result;
}
