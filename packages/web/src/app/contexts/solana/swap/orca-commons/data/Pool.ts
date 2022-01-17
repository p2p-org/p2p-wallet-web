import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import type { PoolConfig, PoolJSON } from '../types';

export enum CurveType {
  // eslint-disable-next-line no-unused-vars
  ConstantProduct = 0,
  // eslint-disable-next-line no-unused-vars
  ConstantPrice = 1,
  // eslint-disable-next-line no-unused-vars
  Stable = 2,
  // eslint-disable-next-line no-unused-vars
  Offset = 3,
}

export function createPoolConfig(obj: PoolJSON): PoolConfig {
  return {
    ...obj,
    account: new PublicKey(obj.account),
    authority: new PublicKey(obj.authority),
    poolTokenMint: new PublicKey(obj.poolTokenMint),
    tokenAccountA: new PublicKey(obj.tokenAccountA),
    tokenAccountB: new PublicKey(obj.tokenAccountB),
    feeAccount: new PublicKey(obj.feeAccount),
    hostFeeAccount: obj.hostFeeAccount ? new PublicKey(obj.hostFeeAccount) : null,
    feeNumerator: new u64(obj.feeNumerator),
    feeDenominator: new u64(obj.feeDenominator),
    ownerTradeFeeNumerator: new u64(obj.ownerTradeFeeNumerator),
    ownerTradeFeeDenominator: new u64(obj.ownerTradeFeeDenominator),
    ownerWithdrawFeeNumerator: new u64(obj.ownerWithdrawFeeNumerator),
    ownerWithdrawFeeDenominator: new u64(obj.ownerWithdrawFeeDenominator),
    hostFeeNumerator: new u64(obj.hostFeeNumerator),
    hostFeeDenominator: new u64(obj.hostFeeDenominator),
    // @ts-ignore
    curveType: (function (): CurveType {
      switch (obj.curveType) {
        case 'ConstantProduct':
          return CurveType.ConstantProduct;
        case 'ConstantPrice':
          return CurveType.ConstantPrice;
        case 'Stable':
          return CurveType.Stable;
        case 'Offset':
          return CurveType.Offset;
      }
    })(),
    amp: obj.amp ? new u64(obj.amp) : undefined,
    deprecated: obj.deprecated || false,
    programVersion: obj.programVersion || 1,
  };
}
