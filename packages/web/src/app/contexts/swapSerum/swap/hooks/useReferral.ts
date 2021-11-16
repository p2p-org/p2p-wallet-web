import { useAsync } from 'react-async-hook';

import type { Market } from '@project-serum/serum';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import { USDC_MINT, USDT_MINT } from '../../common/constants';
import { useSwap } from '../index';

export function useReferral(fromMarket?: Market): PublicKey | undefined {
  const { referral } = useSwap();

  const asyncReferral = useAsync(async () => {
    if (!referral) {
      return undefined;
    }

    if (!fromMarket) {
      return undefined;
    }

    if (
      !fromMarket.quoteMintAddress.equals(USDC_MINT) &&
      !fromMarket.quoteMintAddress.equals(USDT_MINT)
    ) {
      return undefined;
    }

    return Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      fromMarket.quoteMintAddress,
      referral,
    );
  }, [fromMarket]);

  if (!asyncReferral.result) {
    return undefined;
  }

  return asyncReferral.result;
}
