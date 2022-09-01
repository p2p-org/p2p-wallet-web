import { Type } from 'class-transformer';

import { Pool } from './Pool';

// ProgramIDS
export class ProgramIDS {
  // @ts-ignore
  serumTokenSwap: string;
  // @ts-ignore
  tokenSwapV2: string;
  // @ts-ignore
  tokenSwap: string;
  // @ts-ignore
  token: TokenEnum;
  // @ts-ignore
  aquafarm: string;

  // constructor({
  //   serumTokenSwap,
  //   tokenSwapV2,
  //   tokenSwap,
  //   token,
  //   aquafarm,
  // }: {
  //   serumTokenSwap: string;
  //   tokenSwapV2: string;
  //   tokenSwap: string;
  //   token: TokenEnum;
  //   aquafarm: string;
  // }) {
  //   this.serumTokenSwap = serumTokenSwap;
  //   this.tokenSwapV2 = tokenSwapV2;
  //   this.tokenSwap = tokenSwap;
  //   this.token = token;
  //   this.aquafarm = aquafarm;
  // }
}

// OrcaConfigs
export class OrcaInfo {
  @Type(() => Pool)
  // @ts-ignore
  pools: Map<string, Pool>;
  @Type(() => ProgramIDS)
  // @ts-ignore
  programIds: ProgramIDS;
  @Type(() => TokenValue)
  // @ts-ignore
  tokens: Map<string, TokenValue>;

  // constructor({
  //   pools,
  //   programIds,
  //   tokens,
  // }: {
  //   pools: Record<string, Pool>;
  //   programIds: ProgramIDS;
  //   tokens: Record<string, TokenValue>;
  // }) {
  //   this.pools = pools;
  //   this.programIds = programIds;
  //   this.tokens = tokens;
  // }
}

export enum TokenEnum {
  tokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
}

// TokenValue
export class TokenValue {
  // @ts-ignore
  mint: string;
  // @ts-ignore
  name: string;
  // @ts-ignore
  decimals: number;
  fetchPrice?: boolean;
  poolToken?: boolean;
  wrapper?: string;

  // constructor({
  //   mint,
  //   name,
  //   decimals,
  //   fetchPrice,
  //   poolToken,
  //   wrapper,
  // }: {
  //   mint: string;
  //   name: string;
  //   decimals: number;
  //   fetchPrice?: boolean;
  //   poolToken?: boolean;
  //   wrapper?: string;
  // }) {
  //   this.mint = mint;
  //   this.name = name;
  //   this.decimals = decimals;
  //   this.fetchPrice = fetchPrice;
  //   this.poolToken = poolToken;
  //   this.wrapper = wrapper;
  // }
}
