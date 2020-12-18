import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { PayloadAction } from '@reduxjs/toolkit';

import { Pool, SerializablePool } from 'api/pool/Pool';
import { SerializableToken } from 'api/token/Token';
import { SerializableTokenAccount, TokenAccount } from 'api/token/TokenAccount';
import { selectTokenAccount } from 'store/slices/tokenPair/utils/tokenPair';

type Params = {
  publicKey?: string;
};

type PoolState = {
  tokenAccounts: Array<TokenAccount>;
  updateAction: (payload: {
    firstToken?: SerializableToken;
    firstTokenAccount?: SerializableTokenAccount;
  }) => PayloadAction<{ selectedPool?: SerializablePool }>;
};

/**
 * If the react-router location state contains a pool address, then load this pool
 * into the state.
 * This allows the creation of react-route links to specific pools.
 * @param updateAction
 * @param tokenAccounts
 */
export const usePoolFromLocation = ({ updateAction, tokenAccounts }: PoolState): void => {
  const { publicKey } = useParams<Params>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (publicKey) {
      const locationTokenAccount = tokenAccounts.find((token) => {
        return token.address.toBase58() === publicKey;
      });

      const firstToken = locationTokenAccount?.mint;

      const firstTokenAccount = selectTokenAccount(firstToken, tokenAccounts, false);

      if (firstToken) {
        dispatch(
          updateAction({
            firstToken: firstToken?.serialize(),
            firstTokenAccount: firstTokenAccount?.serialize(),
          }),
        );
      }
    }
  }, [publicKey]);
};
