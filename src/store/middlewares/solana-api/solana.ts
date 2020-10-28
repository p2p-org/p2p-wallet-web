import * as web3 from '@solana/web3.js';
import { AnyAction, Middleware } from 'redux';

import { ApiSolanaService } from 'store/middlewares/solana-api/services';
import { RootAction, RootState } from 'store/types';

export const SOLANA_API = 'SOLANA_API';

export type SolanaApiAction = {
  action: RootAction;
  transaction: web3.Transaction;
};

// export type SolanaAction = {
//   [SOLANA_API]: SolanaApiAction;
// };

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

      // const actionWithoutCall = { ...action };
      // delete actionWithoutCall[SOLANA_API];

      const callApi = action[SOLANA_API] as SolanaApiAction;
      const { action: actionSolana, transaction } = callApi;

      // if (!account) {
      //   throw new Error('Unauthorized');
      // }

      next(actionSolana.request());

      try {
        const { account } = getState().data.blockchain;

        const result = await web3.sendAndConfirmTransaction(solanaConn, transaction, [account]);

        next(actionSolana.success(result));

        return result;
      } catch (error) {
        next(actionSolana.failure(error));

        throw error;
      }
    };
  };
};
