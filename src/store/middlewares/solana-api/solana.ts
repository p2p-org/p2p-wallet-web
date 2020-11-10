import * as web3 from '@solana/web3.js';
import { AnyAction, Middleware } from 'redux';

import { ApiSolanaService } from 'store/middlewares/solana-api/services';
import { RootAction, RootState } from 'store/types';

export const SOLANA_API = 'SOLANA_API';

export type SolanaApiAction = {
  action: RootAction;
  transaction: web3.Transaction;
  signers?: web3.Account[];
  options?: web3.ConfirmOptions;
};

export const solanaApiMiddleware = (): Middleware<unknown, RootState> => {
  return ({ getState }) => (next) => {
    return async (action: AnyAction) => {
      if (!action || !action[SOLANA_API]) {
        return next(action);
      }

      const solanaConn = ApiSolanaService.getConnection();

      if (!solanaConn) {
        // TODO: check connection
        console.info('TODO: check connection');
        return;
      }

      const callApi = action[SOLANA_API] as SolanaApiAction;
      const { action: actionSolana, transaction, signers, options } = callApi;

      next(actionSolana.request());

      try {
        const finalSigners = [];

        if (signers) {
          finalSigners.push(...signers);
        } else {
          const { account } = getState().data.blockchain;

          if (!account) {
            throw new Error('Unauthorized');
          }

          finalSigners.push(account);
        }

        const result = await web3.sendAndConfirmTransaction(
          solanaConn,
          transaction,
          finalSigners,
          options,
        );

        next(actionSolana.success(result));

        return result;
      } catch (error) {
        next(actionSolana.failure(error));

        throw error;
      }
    };
  };
};
