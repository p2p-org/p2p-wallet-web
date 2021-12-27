import { Token } from '@solana/spl-token';
import type { Connection } from '@solana/web3.js';
import { Account } from '@solana/web3.js';

import type { ProgramIds } from '../config';
import type { PoolConfig, TokenConfigs } from '../orca-commons';

export function orderTokenPair(tokenX: string, tokenY: string): string[] {
  if (tokenX === 'USDC' && tokenY === 'USDT') {
    return [tokenX, tokenY];
  } else if (tokenY === 'USDC' && tokenX === 'USDT') {
    return [tokenY, tokenX];
  } else if (tokenY === 'USDC' || tokenY === 'USDT') {
    return [tokenX, tokenY];
  } else if (tokenX === 'USDC' || tokenX === 'USDT') {
    return [tokenY, tokenX];
  } else if (tokenX.localeCompare(tokenY) < 0) {
    return [tokenX, tokenY];
  } else {
    return [tokenY, tokenX];
  }
}

export function getTradeId(tokenX: string, tokenY: string) {
  const [tokenA, tokenB] = orderTokenPair(tokenX, tokenY);
  return tokenA + '/' + tokenB;
}

export async function fetchPoolAmounts(
  connection: Connection,
  poolConfig: PoolConfig,
  programIds: ProgramIds,
  tokenConfigs: TokenConfigs,
) {
  const tokenMintA = tokenConfigs[poolConfig.tokenAName].mint;
  const tokenMintB = tokenConfigs[poolConfig.tokenBName].mint;

  const tokenA = new Token(connection, tokenMintA, programIds.token, new Account());
  const tokenB = new Token(connection, tokenMintB, programIds.token, new Account());
  const accountInfos = await Promise.all([
    tokenA.getAccountInfo(poolConfig.tokenAccountA),
    tokenB.getAccountInfo(poolConfig.tokenAccountB),
  ]);

  return {
    tokenAAmount: accountInfos[0].amount,
    tokenBAmount: accountInfos[1].amount,
  };
}
