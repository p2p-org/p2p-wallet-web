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
 * TODO After HE-53, there will be one global pool state, at which time they can be
 * retrieved here using useSelector(), rather than having to be passed in.
 * (likewise with the updateAction property, we can simply dispatch the appropriate updateState action)
 * @param selectedPool
 * @param availablePools
 * @param updateAction
 * @param tokenAccounts
 */
export const usePoolFromLocation = ({ updateAction, tokenAccounts }: PoolState): void => {
  const params = useParams<Params>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (params.publicKey) {
      const tokenAccount = tokenAccounts.find(
        (token) => token.address.toBase58() === params.publicKey,
      );

      const firstToken = tokenAccount?.mint;

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
    // empty deps is a workaround to ensure this only triggers once
  }, [params]);
};
