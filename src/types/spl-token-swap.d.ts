declare module '@solana/spl-token-swap' {
  import { PublicKey } from '@solana/web3.js';

  export class TokenSwap {
    poolToken: PublicKey;

    feeAccount: PublicKey;

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
