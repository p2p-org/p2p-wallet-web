import type { PublicKey } from '@solana/web3.js';

declare module '@solana/spl-token-swap' {
  export interface TokenSwap {
    poolToken: PublicKey;

    feeAccount: PublicKey;

    authority: PublicKey;

    tokenAccountA: PublicKey;

    tokenAccountB: PublicKey;

    mintA: PublicKey;

    mintB: PublicKey;

    curveType: number;

    tradeFeeNumerator: Numberu64;

    tradeFeeDenominator: Numberu64;

    ownerTradeFeeNumerator: Numberu64;

    ownerTradeFeeDenominator: Numberu64;

    ownerWithdrawFeeNumerator: Numberu64;

    ownerWithdrawFeeDenominator: Numberu64;

    hostFeeNumerator: Numberu64;

    hostFeeDenominator: Numberu64;
  }
}
