import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';

import { getTokenAccountInfo } from 'store/_actions/solana';
import { RootState } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

export const useTokenInfo = (publicKey: string) => {
  const dispatch = useDispatch();
  const tokenAccount = useSelector((state: RootState) => state.entities.tokens.items[publicKey]);
  const { name, mint, owner, symbol, amount, decimals } = usePopulateTokenInfo(tokenAccount);

  useEffect(() => {
    const mount = async () => {
      await dispatch(getTokenAccountInfo(new web3.PublicKey(publicKey)));
    };

    if (!tokenAccount) {
      void mount();
    }
  }, [publicKey]);

  return { mint, owner, name, symbol, amount, decimals };
};
